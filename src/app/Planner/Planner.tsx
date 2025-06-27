"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { Flex, Badge, Box, Text, Button, Avatar, Tooltip } from "@chakra-ui/react";
import { SelectButton, SelectList } from "@saas-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@saas-ui/react";

import { colors, styles, tasksStyes } from "./styles";
import { TeamMember } from "./Planner.types";
import { calcHourUsage, findTaskIntersections } from "./Planner.utils";

import people from "../SearchConsultantAnalytics.json";
import schedule from "../SearchConsultantSchedules.json";
import { dayNames } from "./dummyPeriodNames";

export default function Planner() {
  const [filterProjects, setFilterProjects] = useState("all");
  const [filterUsers, setFilterUsers] = useState("all");
  const [filterRoles, setFilterRoles] = useState("all");
  const [filterUtilisations, setFilterUtilisations] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("2 weeks");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);

  const peopleData: TeamMember[] = people.data?.searchConsultantAnalytics;
  const scheduleData = schedule.data?.searchConsultantSchedules;

  const [taskOverrides, setTaskOverrides] = useState<
    Record<
      string,
      Partial<{
        id: string;
        title: string;
        startIdx: number;
        endIdx: number;
        hours: number;
        type: string;
        memberId: string;
        __typename: string;
      }>
    >
  >({});

  const tasks = useMemo(() => {
    const validIds = new Set(peopleData.map((p) => p.consultant.id));
    return (scheduleData || [])
      .flatMap((sched: any) =>
        (sched.assignments || []).map((a: any) => {
          const startIdx = dayNames.findIndex((d) => d.date === a.startDate);
          const endIdx = dayNames.findIndex((d) => d.date === a.endDate);
          const baseTask = {
            id: a.id,
            title: a.project?.name || "Assignment",
            startIdx: startIdx === -1 ? 0 : startIdx,
            endIdx: endIdx === -1 ? 0 : endIdx,
            hours: a.workingHoursPerDay,
            type: a.isBillable ? "b2b" : "support",
            memberId: sched.consultant.id,
            mode: a.mode,
          };
          return { ...baseTask, ...(taskOverrides[a.id] || {}) };
        })
      )
      .filter((task) => validIds.has(task.memberId));
  }, [peopleData, scheduleData, dayNames, taskOverrides]);

  const getTasksForMember = useCallback(
    (memberId: string) => tasks.filter((task) => task.memberId === memberId),
    [tasks]
  );

  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [hoverDay, setHoverDay] = useState<{ day: number; memberId: string } | null>(
    null
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const [taskPositions, setTaskPositions] = useState<
    Record<string, { left: string; top: string; width: string }>
  >({});
  const [resizingTask, setResizingTask] = useState<string | null>(null);
  const [resizePreview, setResizePreview] = useState<{
    taskId: string;
    newEndDate: number;
  } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef<{ taskId: string; newEndDate: number } | null>(null);

  const days = Array.from({ length: dayNames.length }, (_, i) => i + 1);

  // drag & drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    taskId: string,
    left: string,
    top: string,
    width: string
  ) => {
    setDraggedTask(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    const img = new window.Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
    setTaskPositions({ ...taskPositions, [taskId]: { left, top, width } });
  };
  const calculateDropTarget = (e: React.DragEvent) => {
    if (!gridRef.current) return null;
    const grid = gridRef.current;
    const gridRect = grid.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const relativeX = mouseX - gridRect.left;
    const relativeY = mouseY - gridRect.top;
    if (
      relativeX < 0 ||
      relativeX > gridRect.width ||
      relativeY < 0 ||
      relativeY > gridRect.height
    )
      return null;
    const dayWidth = gridRect.width / days.length;
    const dayIndex = Math.floor(relativeX / dayWidth);
    const day = dayIndex + 1;
    const rowHeight = 65;
    const memberIndex = Math.floor(relativeY / rowHeight);
    if (
      day < 1 ||
      day > days.length ||
      memberIndex < 0 ||
      memberIndex >= peopleData.length
    )
      return null;
    return { day, memberId: peopleData[memberIndex].consultant.id };
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const target = calculateDropTarget(e);
    setHoverDay(target);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!gridRef.current?.contains(relatedTarget)) {
      setHoverDay(null);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const target = calculateDropTarget(e);
    if (!target) {
      setDraggedTask(null);
      setHoverDay(null);
      return;
    }
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) {
      setDraggedTask(null);
      setHoverDay(null);
      return;
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      setDraggedTask(null);
      setHoverDay(null);
      return;
    }
    const duration = task.endIdx - task.startIdx;
    const newStartIdx = target.day - 1;
    const newEndIdx = newStartIdx + duration;
    setTaskOverrides((prev) => ({
      ...prev,
      [taskId]: {
        startIdx: newStartIdx,
        endIdx: newEndIdx,
        memberId: target.memberId,
      },
    }));
    setDraggedTask(null);
    setHoverDay(null);
  };
  const handleDragEnd = () => {
    setDraggedTask(null);
    setHoverDay(null);
  };

  // resize handlers
  const handleResizeStart = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingTask(taskId);
    setIsResizing(true);
    const initialTask = tasks.find((t) => t.id === taskId);
    if (!initialTask) return;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!gridRef.current) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const grid = gridRef.current;
      const gridRect = grid.getBoundingClientRect();
      const dayWidth = gridRect.width / days.length;
      const relativeX = moveEvent.clientX - gridRect.left;
      const dayIndex = Math.floor(relativeX / dayWidth);
      const newEndDate = Math.max(task.startIdx, Math.min(days.length - 1, dayIndex));
      const newResizeState = { taskId, newEndDate };
      setResizePreview(newResizeState);
      resizeStateRef.current = newResizeState;
    };
    const handleMouseUp = () => {
      if (resizeStateRef.current && resizeStateRef.current.taskId === taskId) {
        const { taskId: resizeTaskId, newEndDate } = resizeStateRef.current;
        setTaskOverrides((prev) => ({
          ...prev,
          [resizeTaskId]: {
            ...(prev[resizeTaskId] || {}),
            endIdx: newEndDate,
          },
        }));
      }
      setResizingTask(null);
      setResizePreview(null);
      setIsResizing(false);
      resizeStateRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const TeamRow = React.memo(
    ({ id, firstName, lastName, jobTitle, loggedHours, plannedHours, children }: any) => {
      const hourUsage = calcHourUsage(plannedHours, loggedHours);
      return (
        <Tooltip hasArrow label={`${hourUsage}%`}>
          <Flex key={id} px="20px" py="15px" alignItems="center" position="relative">
            <Avatar name={`${firstName} ${lastName}`} size="sm" />
            <Flex sx={{ pl: "14px" }} direction="column">
              <Text
                fontSize="14px"
                lineHeight="20px"
                sx={{
                  maxWidth: "220px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {`${firstName} ${lastName}`}
              </Text>
              <Text fontSize="10px">{jobTitle}</Text>
            </Flex>
            <Box
              sx={{
                ...(styles.utilisationProgress as React.CSSProperties),
                borderRadius: 0,
                height: "3px",
                position: "absolute",
                bottom: 0,
                left: 0,
              }}
            >
              <Box
                sx={{
                  ...(styles.utlilisationProgressFillItem as React.CSSProperties),
                  width: `${hourUsage}%`,
                  maxWidth: "100%",
                  height: "3px",
                  background:
                    hourUsage > 100
                      ? colors.red
                      : hourUsage === 100
                      ? colors.green
                      : colors.yellow,
                }}
              />
            </Box>
            {children}
          </Flex>
        </Tooltip>
      );
    }
  );

  return (
    <>
      <Flex sx={styles.container} direction="column" justifyContent="flex-start">
        <Flex sx={styles.utilisationContainer}>
          <Flex sx={styles.utilisationWrapper}>
            <Flex sx={styles.utilisationBoxTotal}>
              <Flex direction="column">
                <Text sx={styles.utilisationBoxTitle}>Total utilization per week</Text>
                <Flex sx={styles.utilisationProgress}>
                  <Flex sx={styles.utilisationProgressFillWrapper}>
                    <Box
                      sx={{
                        ...(styles.utlilisationProgressFillItem as React.CSSProperties),
                        width: "80%",
                      }}
                    />
                  </Flex>
                </Flex>
              </Flex>
              <Flex direction="column">
                <Text sx={styles.utilisationText}>546h</Text>
              </Flex>
            </Flex>
            <Flex sx={styles.utilisationBoxAssignment}>
              <Flex direction="column" sx={{ width: "100%" }}>
                <Text sx={styles.utilisationBoxTitle}>
                  Utilization per assignment type
                </Text>
                <Flex sx={styles.utilisationProgress}>
                  <Flex sx={styles.utilisationProgressFillWrapper}>
                    <Tooltip hasArrow label="58%">
                      <Box
                        sx={{
                          ...(styles.utlilisationProgressFillItem as React.CSSProperties),
                          width: "58%",
                          background: colors.green,
                          borderRadius: "4px 0 0 4px",
                        }}
                      />
                    </Tooltip>
                    <Tooltip hasArrow label="18%">
                      <Box
                        sx={{
                          ...(styles.utlilisationProgressFillItem as React.CSSProperties),
                          width: "18%",
                          background: colors.yellow,
                          borderRadius: "4px 0 0 4px",
                        }}
                      />
                    </Tooltip>
                    <Tooltip hasArrow label="12%">
                      <Box
                        sx={{
                          ...(styles.utlilisationProgressFillItem as React.CSSProperties),
                          background: colors.red,
                          borderRadius: "0 4px 4px 0",
                          width: "12%",
                        }}
                      />
                    </Tooltip>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex sx={styles.utilisationBoxTotalForPeriod}>
              <Flex direction="column">
                <Text sx={styles.utilisationBoxTitleNormal}>
                  Total for <strong>April</strong>
                </Text>
                <Text
                  sx={{
                    ...(styles.utilisationText as React.CSSProperties),
                    ml: 0,
                  }}
                >
                  2,446h
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex sx={styles.gridWrapper}>
          <Flex sx={styles.gridInnerWrapper}>
            <Flex
              direction="column"
              sx={{
                borderRight: `1px solid ${colors.border}`,
              }}
            >
              <Flex sx={styles.teamTitle} fontSize="14px">
                <Text fontSize="14px" fontWeight={700}>
                  Team
                  <Badge
                    ml="2"
                    variant="outline"
                    rounded="full"
                    fontSize="11px"
                    lineHeight="22px"
                    px="5px"
                  >
                    96
                  </Badge>
                </Text>
              </Flex>
              <Flex sx={styles.teamGrid} direction="column">
                {peopleData.map((member) => (
                  <TeamRow
                    key={member.consultant.id}
                    {...member.consultant}
                    loggedHours={member.loggedHours}
                    plannedHours={member.plannedHours}
                  >
                    {/* Rest of the component content */}
                  </TeamRow>
                ))}
              </Flex>
            </Flex>
            <Flex direction={"column"} sx={{ width: "100%", position: "relative" }}>
              <Flex sx={{ width: "100%" }}>
                {dayNames.map((day, i) => (
                  <Flex
                    key={i}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      border: `1px solid ${colors.border}`,
                      borderLeft: 0,
                      borderTop: 0,

                      flex: 1,
                      height: "60px",
                    }}
                  >
                    <Text fontSize="18px" fontWeight={500}>
                      {i + 1}
                    </Text>
                    <Text fontSize="12px" sx={{ color: colors.gray }}>
                      {day.name}
                    </Text>
                    <Text fontSize="10px" sx={{ color: colors.gray }}>
                      {day.date.slice(-2)}
                    </Text>
                  </Flex>
                ))}
              </Flex>
              <Box
                ref={gridRef}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: `${peopleData.length * 65}px`,
                  zIndex: 1,
                  overflow: "hidden",
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Grid Lines */}
                {Array.from({ length: dayNames.length }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: `${(i * 100) / dayNames.length}%`,
                      top: 0,
                      bottom: 0,
                      width: "1px",
                      background: colors.border,
                      zIndex: 2,
                    }}
                  />
                ))}
                {/* Member Rows */}
                {peopleData.map((member, memberIndex) => (
                  <Box
                    key={member.consultant.id}
                    sx={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: `${memberIndex * 65}px`,
                      height: "65px",
                      borderBottom: `1px solid ${colors.border}`,
                      zIndex: 2,
                    }}
                  />
                ))}
                {/* Hover Indicator */}
                {/* {hoverDay && (
                <Box
                  sx={{
                    position: "absolute",
                    left: `${((hoverDay.day - 1) * 100) / dayNames.length}%`,
                    width: `${100 / dayNames.length}%`,
                    top: `${
                      peopleData.findIndex((m) => m.consultant.id === hoverDay.memberId) *
                      65
                    }px`,
                    height: "65px",
                    background: "#BEE3F8",
                    border: "2px solid #3182CE",
                    opacity: 0.5,
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                />
              )} */}
                {/* Tasks Layer */}
                {peopleData.map((member, memberIndex) => {
                  const memberTasks = getTasksForMember(member.consultant.id);
                  const intersections = findTaskIntersections(memberTasks);
                  return (
                    <React.Fragment key={member.consultant.id}>
                      {intersections.map((inter, idx) => {
                        const left = `${(inter.startIdx * 100) / dayNames.length}%`;
                        const width = `${
                          ((inter.endIdx - inter.startIdx + 1) * 100) / dayNames.length
                        }%`;
                        const top = `${memberIndex * 65}px`;
                        const startDate = dayNames[inter.startIdx]?.date;
                        const endDate = dayNames[inter.endIdx]?.date;
                        const formattedStart = startDate
                          ? dayjs(startDate).format("DD.MM.YYYY")
                          : "";
                        const formattedEnd = endDate
                          ? dayjs(endDate).format("DD.MM.YYYY")
                          : "";

                        // Create tooltip content with dates and task names
                        const tooltipContent = (
                          <Flex direction="column" align="center">
                            <Text fontWeight="bold" fontSize="12px">
                              {formattedStart} - {formattedEnd}
                            </Text>
                            {inter.tasks.map((task, taskIdx) => (
                              <Text key={taskIdx} fontSize="11px" mt={1}>
                                {task.title}
                              </Text>
                            ))}
                          </Flex>
                        );

                        return (
                          <Tooltip
                            key={idx}
                            hasArrow
                            label={tooltipContent}
                            placement="bottom"
                          >
                            <Flex
                              direction="column"
                              align="center"
                              justify="center"
                              sx={{
                                position: "absolute",
                                left,
                                width,
                                top,
                                height: "65px",
                                background: "#eeeeee",
                                border: "1px solid #000000",
                                borderRadius: "6px",
                                zIndex: 50,
                                fontWeight: 700,
                                fontSize: "11px",
                                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                                cursor: "default",
                                textAlign: "center",
                              }}
                            >
                              {inter.tasks.length}
                              <br />
                              tasks
                            </Flex>
                          </Tooltip>
                        );
                      })}
                      {memberTasks.map((task) => {
                        const duration = task.endIdx - task.startIdx + 1;
                        const width = `${(duration * 100) / dayNames.length}%`;
                        const left = `${(task.startIdx * 100) / dayNames.length}%`;
                        const top = `${memberIndex * 65}px`;
                        const isDragging = draggedTask === task.id;
                        const isTaskResizing = resizingTask === task.id;
                        let previewWidth = width;
                        if (resizePreview && resizePreview.taskId === task.id) {
                          const previewDuration =
                            resizePreview.newEndDate - task.startIdx + 1;
                          previewWidth = `${(previewDuration * 100) / dayNames.length}%`;
                        }
                        const taskStyle = tasksStyes[task.mode] || tasksStyes.default;
                        const startDate = dayNames[task.startIdx]?.date;
                        const endDate = dayNames[task.endIdx]?.date;
                        const formattedStart = startDate
                          ? dayjs(startDate).format("DD-MM-YYYY")
                          : "";
                        const formattedEnd = endDate
                          ? dayjs(endDate).format("DD-MM-YYYY")
                          : "";
                        return (
                          <Tooltip
                            hasArrow
                            label={
                              <>
                                {task.title}
                                <br />
                                {`(${formattedStart} - ${formattedEnd})`}
                              </>
                            }
                            isDisabled={isResizing || isDragging}
                          >
                            <Flex
                              key={task.id}
                              draggable={!isTaskResizing && !isResizing}
                              direction="column"
                              justifyContent="center"
                              onDragStart={(e) =>
                                !isResizing &&
                                handleDragStart(e, task.id, left, top, width)
                              }
                              onDragEnd={handleDragEnd}
                              sx={{
                                position: "absolute",
                                left,
                                width:
                                  isTaskResizing && resizePreview?.taskId === task.id
                                    ? previewWidth
                                    : width,
                                top,
                                height: "65px",
                                borderRadius: "6px",
                                ...taskStyle,
                                fontSize: "12px",
                                fontWeight: 600,
                                px: 2,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                opacity: isTaskResizing ? 0.5 : isDragging ? 0.5 : 1,
                                zIndex: 10,
                                cursor: isResizing
                                  ? "default"
                                  : isDragging
                                  ? "grabbing"
                                  : "grab",
                                pointerEvents: isResizing ? "none" : "auto",
                                transition: "box-shadow 0.2s",
                              }}
                            >
                              <Text
                                fontSize="10px"
                                fontWeight={800}
                                sx={{
                                  maxWidth: "100%",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {task.title}
                              </Text>
                              <Text fontSize="10px" color="rgba(116, 116, 116, 1);">
                                {`(${formattedStart} - ${formattedEnd})`}
                              </Text>
                              <Text fontSize="10px" color="rgba(116, 116, 116, 1);">
                                {`(${duration} days)`}
                              </Text>
                              {/* Resize Handle */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  right: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: "12px",
                                  cursor: "e-resize",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 15,
                                  _hover: { background: "rgba(255,255,255,0.2)" },
                                }}
                                onMouseDown={(e) => handleResizeStart(e, task.id)}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Box
                                  sx={{
                                    width: "2px",
                                    height: "16px",
                                    background: "white",
                                    borderRadius: "2px",
                                    opacity: 0.7,
                                    mr: "2px",
                                  }}
                                />
                                <Box
                                  sx={{
                                    width: "2px",
                                    height: "16px",
                                    background: "white",
                                    borderRadius: "2px",
                                    opacity: 0.7,
                                  }}
                                />
                              </Box>
                            </Flex>
                          </Tooltip>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                {/* Resize Preview Overlay */}
                {resizingTask &&
                  resizePreview &&
                  (() => {
                    const task = tasks.find((t: any) => t.id === resizingTask);
                    if (!task) return null;
                    const memberIndex = peopleData.findIndex(
                      (m) => m.consultant.id === task.memberId
                    );
                    const previewDuration = resizePreview.newEndDate - task.startIdx + 1;
                    const previewWidth = `${(previewDuration * 100) / dayNames.length}%`;
                    const left = `${(task.startIdx * 100) / dayNames.length}%`;
                    const taskStyle = tasksStyes[task.mode] || tasksStyes.default;
                    const startDate = dayNames[task.startIdx]?.date;
                    const endDate = dayNames[resizePreview.newEndDate]?.date;
                    const formattedStart = startDate
                      ? dayjs(startDate).format("DD-MM-YYYY")
                      : "";
                    const formattedEnd = endDate
                      ? dayjs(endDate).format("DD-MM-YYYY")
                      : "";
                    return (
                      <Flex
                        direction="column"
                        justifyContent="center"
                        sx={{
                          position: "absolute",
                          left,
                          width: previewWidth,
                          top: `${memberIndex * 65}px`,
                          height: "65px",
                          borderRadius: "6px",
                          ...taskStyle,
                          fontWeight: 700,
                          px: 2,
                          cursor: "e-resize",
                          whiteSpace: "nowrap",
                          zIndex: 30,
                          pointerEvents: "none",
                        }}
                      >
                        <Text fontSize="10px" fontWeight={800}>
                          {task.title}
                        </Text>
                        <Text fontSize="10px" color="rgba(116, 116, 116, 1);">
                          {`(${formattedStart} - ${formattedEnd})`}
                        </Text>
                        <Text fontSize="10px" color="rgba(116, 116, 116, 1);">
                          {`(${previewDuration} days)`}
                        </Text>
                      </Flex>
                    );
                  })()}
                {/* Drag Preview */}
                {draggedTask &&
                  hoverDay &&
                  (() => {
                    const task = tasks.find((t: any) => t.id === draggedTask);
                    if (!task) return null;
                    const memberIndex = peopleData.findIndex(
                      (m) => m.consultant.id === hoverDay.memberId
                    );
                    if (memberIndex === -1) return null;
                    const duration = task.endIdx - task.startIdx + 1;
                    const width = `${(duration * 100) / dayNames.length}%`;
                    const left = `${((hoverDay.day - 1) * 100) / dayNames.length}%`;
                    const taskStyle = tasksStyes[task.mode] || tasksStyes.default;
                    const startIdx = hoverDay.day - 1;
                    const endIdx = startIdx + duration - 1;
                    const startDate = dayNames[startIdx]?.date;
                    const endDate = dayNames[endIdx]?.date;
                    const formattedStart = startDate
                      ? dayjs(startDate).format("DD-MM-YYYY")
                      : "";
                    const formattedEnd = endDate
                      ? dayjs(endDate).format("DD-MM-YYYY")
                      : "";
                    return (
                      <Flex
                        direction="column"
                        justifyContent="center"
                        sx={{
                          position: "absolute",
                          left,
                          width,
                          top: `${memberIndex * 65}px`,
                          height: "65px",
                          borderRadius: "6px",
                          ...taskStyle,
                          fontWeight: 700,
                          px: 2,
                          whiteSpace: "nowrap",
                          zIndex: 30,
                          pointerEvents: "none",
                        }}
                      >
                        <Text fontSize="10px" fontWeight={800}>
                          {task.title}
                        </Text>
                        <Text fontSize="10px" color="rgba(116, 116, 116, 1);">
                          {`(${formattedStart} - ${formattedEnd})`}
                        </Text>
                        <Text fontSize="10px" color="rgba(116, 116, 116, 1);">
                          {`(${duration} days)`}
                        </Text>
                      </Flex>
                    );
                  })()}
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

export const calcHourUsage = (planned: number | null, logged: number | null) =>
  logged === null || planned === null ? 0 : Math.round((logged! / planned!) * 100);

export const findTaskIntersections = (tasks: any[]) => {
  const intersections: { startIdx: number; endIdx: number; tasks: any[] }[] = [];
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const a = tasks[i];
      const b = tasks[j];
      const start = Math.max(a.startIdx, b.startIdx);
      const end = Math.min(a.endIdx, b.endIdx);
      if (start <= end) {
        // Check if this intersection already exists
        const existingIntersection = intersections.find(
          (x) => x.startIdx === start && x.endIdx === end
        );

        if (existingIntersection) {
          // Add tasks to existing intersection if not already present
          if (!existingIntersection.tasks.find((t) => t.id === a.id)) {
            existingIntersection.tasks.push(a);
          }
          if (!existingIntersection.tasks.find((t) => t.id === b.id)) {
            existingIntersection.tasks.push(b);
          }
        } else {
          // Create new intersection
          intersections.push({
            startIdx: start,
            endIdx: end,
            tasks: [a, b],
          });
        }
      }
    }
  }
  return intersections;
};

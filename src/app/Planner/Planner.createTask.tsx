"use client";

import { FC } from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

import AddEditAssignmentForm from "@/components/platform/planner/add-edit-assignment";
import { PlannerCreateModal } from "./Planner.types";

const PlannerCreateTask: FC<PlannerCreateModal> = ({ isOpen, handleClose }) => {
  return (
    <Modal size="6xl" blockScrollOnMount={false} isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Add new assignment
          {/* {addNewAssignment ? "Add new assignment" : "Edit assignment"} */}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AddEditAssignmentForm
            onClose={handleClose}
            // onSubmit={onSubmit}
            // onDelete={onDelete}
            onSubmit={handleClose}
            onDelete={handleClose}
            consultants={[]}
            projects={[]}
            item={{} as any}
            // isWriteAccessDisabled={writeDisabledReason === "permissions"}
            isWriteAccessDisabled={false}
            loading={{
              // create: createLoding,
              // update: updateLoding,
              // delete: deleteLoding,
              create: false,
              update: false,
              delete: false,
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PlannerCreateTask;

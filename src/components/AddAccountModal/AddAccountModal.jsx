// React
import { useState } from "react";

// Thirdparty
import Modal from "react-responsive-modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// Utils

// APISlices

// Slice

// CustomHooks

// Components

// Constants

// Enums

// Interfaces

// Styles
import styles from "./AddAccountModal.module.css";
import { useForm } from "react-hook-form";
import TextField from "../ui/TextField/TextField";
import { Button } from "../ui/button";
import { useCreateAccountMutation } from "@/store/apiSlices/childApiSlices/accountsApiSlice";
import { toast } from "react-toastify";

// Local enums

// Local constants

// Local Interfaces

const schema = yup.object().shape({
  name: yup.string().required("Title is required!"),
});

const AddAccountModal = (props) => {
  const { open, onCloseModal } = props;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [createAccount] = useCreateAccountMutation();

  const formSubmitHandler = async (data) => {
    const response = await createAccount(data);

    if (response.data) {
      // Show Toast
      toast.success("Transaction Added Successfully", {
        position: "bottom-center",
      });

      // Reset Form
      reset();
    } else {
      // Show Toast
      toast.error("Something went wrong", {
        position: "bottom-center",
      });
    }

    // Close Modal
    onCloseModal();
  };

  return (
    <div>
      <Modal open={open} onClose={onCloseModal} center className={styles.modal}>
        <h2 className={styles.modalHeading}>Add Account</h2>
        <form onSubmit={handleSubmit(formSubmitHandler)}>
          <TextField
            errors={errors}
            register={register}
            placeholder="Account Name"
            name="name"
          />
          <Button type="submit" variant="default">
            Add Account
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AddAccountModal;

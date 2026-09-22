'use client';

import {
  type ChangeEventHandler,
  type FormEventHandler,
  useState,
} from 'react';

//추후 훅 삭제 예정 modal form
type FieldElement = HTMLInputElement | HTMLTextAreaElement;
type FieldChangeHandler = ChangeEventHandler<FieldElement>;
type FormSubmitHandler = FormEventHandler<HTMLFormElement>;

export function useModalForm<T extends Record<keyof T, string>>(
  initialValue: T,
  onSubmit: (formData: T) => void,
) {
  const [formData, setFormData] = useState<T>(initialValue);

  const handleInputChange: FieldChangeHandler = (event) => {
    const { name, value } = event.currentTarget;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return { formData, setFormData, handleInputChange, handleSubmit };
}

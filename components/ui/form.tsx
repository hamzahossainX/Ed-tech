"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

const Form = FormProvider;
type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = { name: TName };
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(props: ControllerProps<TFieldValues, TName>) {
  return <FormFieldContext.Provider value={{ name: props.name }}><Controller {...props} /></FormFieldContext.Provider>;
}

const FormItemContext = React.createContext<{ id: string }>({ id: "" });
function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return <FormItemContext.Provider value={{ id }}><div className={cn("space-y-2", className)} {...props} /></FormItemContext.Provider>;
}

function useFormField() {
  const field = React.useContext(FormFieldContext);
  const item = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const state = getFieldState(field.name, formState);
  return { ...state, formItemId: `${item.id}-item`, formDescriptionId: `${item.id}-description`, formMessageId: `${item.id}-message` };
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();
  return <LabelPrimitive.Root htmlFor={formItemId} className={cn("text-xs font-black uppercase tracking-[.12em] text-black/50 dark:text-white/50", error && "text-red-600 dark:text-red-400", className)} {...props} />;
}

function FormControl(props: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return <Slot id={formItemId} aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />;
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return <p id={formDescriptionId} className={cn("text-xs text-black/40 dark:text-white/40", className)} {...props} />;
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : children;
  if (!body) return null;
  return <p id={formMessageId} className={cn("text-xs font-semibold text-red-600 dark:text-red-400", className)} {...props}>{body}</p>;
}

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };

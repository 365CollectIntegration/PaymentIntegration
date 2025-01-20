import classNames from "classnames";
import { Path, RegisterOptions, UseFormRegister } from "react-hook-form";

type NumberFieldProps<FormT> = {
  placeholder?: string;
  id: Path<FormT>;
  label?: string;
  // @ts-expect-error - number
  register: UseFormRegister<FormT>;
  // @ts-expect-error - register
  registerOptions?: RegisterOptions<FormT, Path<FormT>>;
  errorMessage?: string;
};

export const NumberField = <FormT,>({
  label,
  id,
  register,
  registerOptions,
  placeholder,
  errorMessage,
}: NumberFieldProps<FormT>) => {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm text-pa-normal">
          {label}
        </label>
      ) : null}

      <input
        autoComplete="off"
        id={id}
        className={classNames(
          "ease w-full rounded-md border border-pa-border bg-transparent px-3 py-2 text-sm text-pa-normal shadow-sm transition duration-300 placeholder:text-slate-400 focus:shadow focus:outline-none",
          !errorMessage && "focus:border-pa-primary"
        )}
        placeholder={placeholder}
        {...register(id, registerOptions)}
      />

      {errorMessage ? <p className="text-pa-danger">{errorMessage}</p> : null}
    </div>
  );
};

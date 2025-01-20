import classNames from "classnames";
import { Path, RegisterOptions, UseFormRegister } from "react-hook-form";

export type TSelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps<FormT> = {
  placeholder?: string;
  id: Path<FormT>;
  label?: string;
  // @ts-expect-error - register
  register: UseFormRegister<FormT>;
  // @ts-expect-error - register
  registerOptions?: RegisterOptions<FormT, Path<FormT>>;
  errorMessage?: string;
  value: string;
  options?: TSelectOption[];
};

export const SelectField = <FormT,>({
  label,
  id,
  register,
  registerOptions,
  errorMessage,
  options,
  value,
  placeholder,
}: SelectFieldProps<FormT>) => {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm text-pa-normal">
          {label}
        </label>
      ) : null}

      <select
        id={id}
        className={classNames(
          "block w-full rounded-md border border-pa-border bg-transparent py-2 pl-3 pr-4 text-sm text-pa-normal shadow-sm transition duration-300 placeholder:text-slate-400 focus:shadow focus:outline-none",
          !errorMessage && "focus:border-pa-primary"
        )}
        {...register(id, registerOptions)}
        defaultValue={value}
      >
        {!value ? <option value={undefined}>{placeholder ?? ""}</option> : null}

        {options?.map?.(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {errorMessage ? <p className="text-pa-danger">{errorMessage}</p> : null}
    </div>
  );
};

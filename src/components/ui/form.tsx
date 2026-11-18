import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { SelectMenu } from '@/components/ui/select'
import './form.css'

interface FieldWrapperProps {
  label?: string
  error?: string
  hint?: string
  children: ReactNode
}

function FieldWrapper({ label, error, hint, children }: FieldWrapperProps) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}</span>}
      {children}
      {error && <span className="field__error">{error}</span>}
      {!error && hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
}

export function Input({ label, error, hint, icon, className = '', ...rest }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <div className={`input-shell ${error ? 'is-error' : ''}`}>
        {icon}
        <input className={`input ${className}`} {...rest} />
      </div>
    </FieldWrapper>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
  icon?: ReactNode
}

export function Select({ label, error, hint, options, placeholder, icon, className = '', value, onChange, disabled, ...rest }: SelectProps) {
  const emit = (next: string) => onChange?.({ target: { value: next }, currentTarget: { value: next } } as ChangeEvent<HTMLSelectElement>)

  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <div className={`select-shell ${error ? 'is-error' : ''}`}>
        {icon}
        <SelectMenu
          value={String(value ?? '')}
          onValueChange={emit}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={rest['aria-label'] ?? label}
          triggerClassName={`!h-[42px] !rounded-none !border-0 !bg-transparent !px-0 !text-[13.5px] hover:!border-0 focus-visible:!ring-0 ${className}`}
        />
      </div>
    </FieldWrapper>
  )
}

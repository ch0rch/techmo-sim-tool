"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface FormattedNumberInputProps {
  id: string
  value: number | string
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  required?: boolean
  className?: string
}

export function FormattedNumberInput({
  id,
  value,
  onChange,
  placeholder,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  required = false,
  className,
}: FormattedNumberInputProps) {
  const [displayValue, setDisplayValue] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Format the number when the value prop changes and we're not editing
  useEffect(() => {
    if (!isEditing && value) {
      const numValue = typeof value === "string" ? Number.parseFloat(value.replace(/\./g, "")) : value
      if (!isNaN(numValue)) {
        setDisplayValue(formatNumber(numValue))
      }
    } else if (!isEditing && !value) {
      setDisplayValue("")
    }
  }, [value, isEditing])

  // Format a number with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString("es-AR").replace(/,/g, ".")
  }

  // Handle focus event - switch to editing mode
  const handleFocus = () => {
    setIsEditing(true)
    // Optionally convert to raw number for easier editing
    if (value) {
      const rawValue = typeof value === "string" ? value.replace(/\./g, "") : value.toString()
      setDisplayValue(rawValue)
    }
  }

  // Handle change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow only digits
    const cleanValue = inputValue.replace(/\D/g, "")
    setDisplayValue(cleanValue)

    // Pass the raw numeric value to parent
    onChange(cleanValue)
  }

  // Handle blur event - format the number and validate
  const handleBlur = () => {
    setIsEditing(false)

    if (displayValue) {
      let numValue = Number.parseInt(displayValue, 10)

      if (!isNaN(numValue)) {
        // Apply limits
        if (numValue < min) numValue = min
        if (numValue > max) numValue = max

        // Update parent with validated value
        onChange(numValue.toString())

        // Format for display
        setDisplayValue(formatNumber(numValue))
      }
    } else {
      onChange("")
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
      <Input
        id={id}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={`pl-7 ${className}`}
      />
    </div>
  )
}

"use client"

import { useTranslations } from "next-intl"
import { ChevronDown } from "@/lib/icons"
import { FormField } from "./form-field"
import { cn } from "@/lib/utils"
import type { Account } from "@/types"

export interface AccountSelectorProps {
  accounts: Account[]
  value: string
  onChange: (id: string) => void
  label?: string
  excludeId?: string
  showBalance?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Универсальный селектор финансового аккаунта
 * Используется в формах финансов, переводов и других операциях с аккаунтами
 */
export function AccountSelector({
  accounts,
  value,
  onChange,
  label,
  excludeId,
  showBalance = true,
  placeholder,
  disabled = false,
  className,
}: AccountSelectorProps) {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")

  const filteredAccounts = excludeId ? accounts.filter((acc) => acc.id !== excludeId) : accounts

  const selectedAccount = accounts.find((acc) => acc.id === value)

  const getAccountTypeLabel = (type: Account["type"]) => {
    const icons: Record<string, string> = {
      cash: "💵",
      card: "💳",
      bank: "🏦",
      deposit: "📈",
      investment: "📊",
      crypto: "₿",
    }
    const labels: Record<string, string> = {
      cash: t("accounts.accountTypes.cash"),
      card: t("accounts.accountTypes.card"),
      bank: t("accounts.accountTypes.bank"),
      deposit: t("accounts.accountTypes.deposit"),
      investment: t("accounts.accountTypes.investment"),
      crypto: t("accounts.accountTypes.crypto"),
    }
    return `${icons[type] || ""} ${labels[type] || type}`
  }

  return (
    <FormField label={label}>
      <div className="relative">
        <button
          type="button"
          disabled={disabled || filteredAccounts.length === 0}
          onClick={() => !disabled && filteredAccounts.length > 0 && onChange(value)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedAccount && "text-muted-foreground",
            className
          )}
        >
          <span>
            {selectedAccount
              ? `${getAccountTypeLabel(selectedAccount.type)} • ${selectedAccount.name}${
                  showBalance
                    ? ` (${selectedAccount.balance.toLocaleString()} ${selectedAccount.currency})`
                    : ""
                }`
              : placeholder || t("accounts.selectAccount")}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {value && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border bg-background shadow-lg">
            <div className="max-h-60 overflow-auto p-1">
              {filteredAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => onChange(acc.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent",
                    value === acc.id && "bg-accent"
                  )}
                >
                  <div className="font-medium">
                    {getAccountTypeLabel(acc.type)} • {acc.name}
                  </div>
                  {showBalance && (
                    <div className="text-xs text-muted-foreground">
                      {acc.balance.toLocaleString()} {acc.currency}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormField>
  )
}

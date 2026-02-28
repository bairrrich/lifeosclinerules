"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Wallet } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Button } from "@/components/ui/button"
import { CrudManager } from "@/components/shared"
import { useSettings, useAccountTypes } from "./settings-context"
import type { Account } from "@/types"

export function AccountsManager() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
  const accountTypes = useAccountTypes()
  const {
    accounts,
    editingAccount,
    setEditingAccount,
    createAccount,
    updateAccountData,
    deleteAccountData,
    units,
  } = useSettings()

  // Фильтруем валюты из единиц измерения (тип "money")
  const currencyUnits = units.filter((u) => u.type === "money")
  const defaultCurrency = currencyUnits[0]?.abbreviation || "RUB"

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

  const renderForm = (
    item: Account | null,
    onChange: (updates: Partial<Account>) => void,
    onSave: () => void,
    onCancel: () => void
  ) => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="sr-only">{t("accounts.name")}</Label>
            <Input
              value={item?.name || ""}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={t("accounts.name")}
            />
          </div>
          <div className="space-y-1">
            <Label className="sr-only">{t("accounts.type")}</Label>
            <NativeSelect
              value={item?.type || "card"}
              onChange={(e) => onChange({ type: e.target.value as Account["type"] })}
            >
              {accountTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="sr-only">{t("accounts.balance")}</Label>
            <Input
              type="number"
              value={item?.balance || 0}
              onChange={(e) => onChange({ balance: Number(e.target.value) })}
              placeholder={t("accounts.balance")}
            />
          </div>
          <div className="space-y-1">
            <Label className="sr-only">{t("accounts.currency")}</Label>
            <NativeSelect
              value={item?.currency || defaultCurrency}
              onChange={(e) => onChange({ currency: e.target.value })}
            >
              {currencyUnits.map((unit) => (
                <option key={unit.id} value={unit.abbreviation}>
                  {unit.name} ({unit.abbreviation})
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave}>
            {tCommon("save")}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        </div>
      </div>
    )
  }

  const renderItem = (item: Account, onEdit: () => void, onDelete: () => void) => {
    return (
      <div>
        <div className="font-medium">
          {getAccountTypeLabel(item.type)} • {item.name}
        </div>
        <div className="text-sm text-muted-foreground">
          {t("accounts.balance")}: {item.balance.toLocaleString()} {item.currency}
        </div>
      </div>
    )
  }

  return (
    <CrudManager
      title={t("accounts.title")}
      description={t("accounts.description")}
      icon={Wallet}
      items={accounts}
      editingItem={editingAccount}
      setEditingItem={setEditingAccount}
      onCreate={createAccount}
      onUpdate={(id: string) => updateAccountData(id, editingAccount!)}
      onDelete={(id: string) => deleteAccountData(id)}
      getKey={(item) => item.id}
      renderForm={renderForm}
      renderItem={renderItem}
      emptyMessage={t("accounts.noAccounts")}
    />
  )
}

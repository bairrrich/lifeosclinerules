"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { Wallet } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { CrudManager } from "@/components/shared"
import { useSettings, useAccountTypes } from "./settings-context"
import { getLocalizedEntityName } from "@/lib/db"
import type { Account } from "@/types"

export function AccountsManager() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
  const locale = useLocale()
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
  const currencyUnits = useMemo(() => units.filter((u) => u.type === "money"), [units])
  const defaultCurrency = currencyUnits.find((u) => u.id === "USD")?.id || "USD"

  // Локализованные названия валют
  const [localizedCurrencyNames, setLocalizedCurrencyNames] = useState<Record<string, string>>({})

  useEffect(() => {
    loadLocalizedCurrencies()
  }, [locale, units.length])

  async function loadLocalizedCurrencies() {
    const localizedNames: Record<string, string> = {}
    for (const unit of currencyUnits) {
      localizedNames[unit.id] = await getLocalizedEntityName(
        "unit",
        unit.id,
        locale,
        unit.name,
        undefined
      )
    }
    setLocalizedCurrencyNames(localizedNames)
  }

  const getAccountTypeLabel = (type: Account["type"]) => {
    const labels: Record<string, string> = {
      cash: t("accounts.accountTypes.cash"),
      card: t("accounts.accountTypes.card"),
      bank: t("accounts.accountTypes.bank"),
      deposit: t("accounts.accountTypes.deposit"),
      investment: t("accounts.accountTypes.investment"),
      crypto: t("accounts.accountTypes.crypto"),
    }
    return labels[type] || type
  }

  const renderForm = (
    item: Account | null,
    onChange: (updates: Partial<Account>) => void,
    onSave: () => void,
    onCancel: () => void
  ) => {
    // Преобразуем типы аккаунтов в формат Combobox
    const accountTypeOptions = accountTypes.map((t) => ({
      id: t.value,
      label: `${t.emoji} ${t.label}`,
    }))

    // Преобразуем валюты в формат Combobox с локализованными названиями
    const currencyOptions = currencyUnits.map((unit) => ({
      id: unit.id,
      label: `${localizedCurrencyNames[unit.id] || unit.name} (${unit.abbreviation})`,
    }))

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
            <Combobox
              options={accountTypeOptions}
              value={item?.type || "card"}
              onChange={(value) => onChange({ type: value as Account["type"] })}
              mode="single"
              allowCustom={false}
              searchable={false}
              placeholder={t("accounts.type")}
            />
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
            <Combobox
              options={currencyOptions}
              value={item?.currency || defaultCurrency}
              onChange={(value) => onChange({ currency: value as string })}
              mode="single"
              allowCustom={false}
              searchable={false}
              placeholder={t("accounts.currency")}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="action-sm" onClick={onSave}>
            {tCommon("save")}
          </Button>
          <Button size="action-sm" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        </div>
      </div>
    )
  }

  const renderItem = (item: Account, onEdit: () => void, onDelete: () => void) => {
    const accountType = accountTypes.find((t) => t.value === item.type)
    const IconComponent = accountType?.icon
    return (
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {accountType?.label || getAccountTypeLabel(item.type)} • {item.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("accounts.balance")}: {item.balance.toLocaleString()} {item.currency}
          </div>
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

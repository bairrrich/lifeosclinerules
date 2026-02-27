"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Wallet, Plus, Save, Edit2, Trash2 } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettings, accountTypes } from "./settings-context"
import type { Account } from "@/types"

export function AccountsManager() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
  const {
    accounts,
    editingAccount,
    setEditingAccount,
    createAccount,
    updateAccountData,
    deleteAccountData,
  } = useSettings()

  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "card" as Account["type"],
    balance: 0,
    currency: "RUB",
  })

  const handleCreate = async () => {
    if (!newAccount.name.trim()) return
    await createAccount({
      name: newAccount.name,
      type: newAccount.type,
      balance: newAccount.balance,
      currency: newAccount.currency,
    })
    setNewAccount({ name: "", type: "card", balance: 0, currency: "RUB" })
  }

  const handleUpdate = async () => {
    if (!editingAccount) return
    await updateAccountData(editingAccount.id, {
      name: editingAccount.name,
      type: editingAccount.type,
      balance: editingAccount.balance,
      currency: editingAccount.currency,
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm(tCommon("delete"))) {
      await deleteAccountData(id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          {t("accounts.title")}
        </CardTitle>
        <CardDescription>{t("accounts.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список аккаунтов */}
        {accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((account) => {
              const accountType = accountTypes.find((t) => t.value === account.type)
              const AccountIcon = accountType?.icon || Wallet
              return (
                <div key={account.id} className="p-3 rounded-xl bg-muted space-y-3">
                  {editingAccount?.id === account.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`edit-acc-name-${account.id}`} className="sr-only">
                            {t("accounts.name")}
                          </Label>
                          <Input
                            id={`edit-acc-name-${account.id}`}
                            value={editingAccount.name}
                            onChange={(e) =>
                              setEditingAccount({ ...editingAccount, name: e.target.value })
                            }
                            placeholder={t("accounts.name")}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`edit-acc-type-${account.id}`} className="sr-only">
                            {t("accounts.type")}
                          </Label>
                          <select
                            id={`edit-acc-type-${account.id}`}
                            className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            value={editingAccount.type}
                            onChange={(e) =>
                              setEditingAccount({
                                ...editingAccount,
                                type: e.target.value as Account["type"],
                              })
                            }
                          >
                            {accountTypes.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`edit-acc-balance-${account.id}`} className="sr-only">
                            {t("accounts.balance")}
                          </Label>
                          <Input
                            id={`edit-acc-balance-${account.id}`}
                            type="number"
                            value={editingAccount.balance}
                            onChange={(e) =>
                              setEditingAccount({
                                ...editingAccount,
                                balance: Number(e.target.value),
                              })
                            }
                            placeholder={t("accounts.balance")}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`edit-acc-currency-${account.id}`} className="sr-only">
                            {t("accounts.currency")}
                          </Label>
                          <Input
                            id={`edit-acc-currency-${account.id}`}
                            value={editingAccount.currency}
                            onChange={(e) =>
                              setEditingAccount({ ...editingAccount, currency: e.target.value })
                            }
                            placeholder={t("accounts.currency")}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdate}>
                          <Save className="h-4 w-4 mr-1" />
                          {tCommon("save")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingAccount(null)}>
                          {tCommon("cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AccountIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {accountType?.label} • {account.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Баланс: {account.balance.toLocaleString()} {account.currency}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingAccount(account)}
                          aria-label={tCommon("edit")}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(account.id)}
                          aria-label={tCommon("delete")}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            {t("accounts.noAccounts")}
          </div>
        )}

        {/* Форма добавления */}
        <div className="p-3 rounded-xl border-2 border-dashed space-y-3">
          <div className="text-sm font-medium">{t("accounts.addAccount")}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="new-acc-name" className="sr-only">
                {t("accounts.name")}
              </Label>
              <Input
                id="new-acc-name"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder={t("accounts.name")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-acc-type" className="sr-only">
                {t("accounts.type")}
              </Label>
              <select
                id="new-acc-type"
                className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={newAccount.type}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, type: e.target.value as Account["type"] })
                }
              >
                {accountTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="new-acc-balance" className="sr-only">
                {t("accounts.initialBalance")}
              </Label>
              <Input
                id="new-acc-balance"
                type="number"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
                placeholder={t("accounts.initialBalance")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-acc-currency" className="sr-only">
                {t("accounts.currency")}
              </Label>
              <Input
                id="new-acc-currency"
                value={newAccount.currency}
                onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                placeholder={`${t("accounts.currency")} (RUB)`}
              />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!newAccount.name.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            {tCommon("add")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

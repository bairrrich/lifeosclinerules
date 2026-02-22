"use client"

import { useEffect, useRef } from "react"

/**
 * Компонент для предотвращения сдвига контента при блокировке скролла Radix UI.
 * 
 * Проблема: Radix UI устанавливает overflow:hidden на html/body при открытии селектов/диалогов,
 * что убирает скроллбар и вызывает сдвиг контента на ширину скроллбара.
 * 
 * Решение: 
 * 1. Используем setProperty с !important для принудительного сохранения overflow-y: scroll
 * 2. Удаляем любые inline стили, которые добавляет Radix
 */
export function ScrollLockFix() {
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Функция для принудительного сброса стилей
    const forceScroll = () => {
      const html = document.documentElement
      const body = document.body
      
      // Устанавливаем overflow-y: scroll с !important на html
      html.style.setProperty("overflow-y", "scroll", "important")
      
      // Удаляем padding-right на body если он установлен
      if (body.style.paddingRight && body.style.paddingRight !== "0px") {
        body.style.setProperty("padding-right", "0px", "important")
      }
      
      // Удаляем любые inline стили, которые могут быть добавлены Radix UI
      if (body.hasAttribute('style') && body.style.overflow?.includes('hidden')) {
        const style = body.getAttribute('style') || '';
        const newStyle = style.replace(/overflow\s*:\s*hidden\s*(!important)?\s*;?\s*/gi, '');
        body.setAttribute('style', newStyle);
      }
      
      if (html.hasAttribute('style') && html.style.overflow?.includes('hidden')) {
        const style = html.getAttribute('style') || '';
        const newStyle = style.replace(/overflow\s*:\s*hidden\s*(!important)?\s*;?\s*/gi, '');
        html.setAttribute('style', newStyle);
      }
    }

    // MutationObserver для немедленного реагирования
    const observer = new MutationObserver(() => {
      // Используем requestAnimationFrame для синхронизации с рендером
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(forceScroll)
    })

    // Наблюдаем за html и body
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    })

    // Начальная установка
    forceScroll()

    // Также проверяем периодически
    const interval = setInterval(forceScroll, 100)

    return () => {
      observer.disconnect()
      clearInterval(interval)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return null
}

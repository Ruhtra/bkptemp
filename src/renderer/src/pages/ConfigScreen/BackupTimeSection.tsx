'use client'

import { FormField, FormItem, FormLabel, FormMessage } from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { motion } from 'framer-motion'
import { UseFormReturn } from 'react-hook-form'
import { useEffect, useState } from 'react'

export function BackupTimeSection({ form }: { form: UseFormReturn<any> }) {
  const [displayTime, setDisplayTime] = useState('00:00')

  useEffect(() => {
    const cronExpression = form.getValues('backupCron')
    if (cronExpression) {
      const [_seconds, minute, hour] = cronExpression.split(' ')

      setDisplayTime(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`)
    }
  }, [form])

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = event.target.value.split(':')
    const cronExpression = `00 ${minutes} ${hours} * * *`
    form.setValue('backupCron', cronExpression)
    console.log(cronExpression)

    setDisplayTime(event.target.value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <FormField
        control={form.control}
        name="backupCron"
        render={({}) => (
          <FormItem>
            <FormLabel htmlFor="backupCron">Horário do Backup Diário</FormLabel>
            <Input
              id="backupCron"
              type="time"
              value={displayTime}
              onChange={handleTimeChange}
              className="mt-1"
            />

            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  )
}

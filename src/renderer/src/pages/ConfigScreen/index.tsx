'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { BackupFilesSection } from './BackupFilesSection'
import { Form } from '@renderer/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { BackupTimeSection } from './BackupTimeSection'
import { OutputFolderSection } from './OutputFolderSection'
import { RemoteConfigSection } from './RemoteConfigSection'
import { ActionButtons } from './ActionButtons'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Options } from 'electron'

//puxar da shared

const formSchema = z
  .object({
    backupFiles: z.array(z.string()).default([]),
    dayToKeep: z.number().min(1).max(7).default(7),
    backupCron: z.string().min(1).default('00 00 08 * * *'),
    outputFolder: z.string().min(1).default('c:\\out'),

    sendFile: z.boolean().default(false),
    pathRemote: z.string().nullable().default(null),
    sftpUser: z.string().nullable().default(null),
    sftpHost: z.string().nullable().default(null),
    sftpPort: z.string().nullable().default(null),
    sshKeyPath: z.string().nullable().default(null)
  })
  .default({})

type configType = z.infer<typeof formSchema>

export function ConfigScreen() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const form = useForm<configType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      backupFiles: [],
      backupCron: '00 00 08 * * *',
      outputFolder: 'c:\\out',

      sendFile: false,
      pathRemote: '',
      sftpUser: '',
      sftpHost: '',
      sftpPort: '22',
      sshKeyPath: `/.ssh/id_rsa`
    }
    // defaultValues: {
    //   backupConfig: [],
    //   backupTime: '00 00 * * *',
    //   outputFolder: '',
    //   saveRemotely: false,
    //   remoteConfig: {
    //     pathRemote: '',
    //     sftpUser: '',
    //     sftpHost: '',
    //     sftpPort: '22',
    //     sshKeyPath: `/.ssh/id_rsa`
    //   }
    // }
  })

  useEffect(() => {
    if (window.api) {
      window.api
        .getConfig()
        //remove typing any
        .then(({ backupConfig }: any) => {
          form.reset({
            backupFiles: backupConfig.backupFiles,
            backupCron: backupConfig.backupCron,
            outputFolder: backupConfig.outputFolder,

            sendFile: backupConfig.sendFile,
            pathRemote: backupConfig.pathRemote,
            sftpUser: backupConfig.sftpUser,
            sftpHost: backupConfig.sftpHost,
            sftpPort: backupConfig.sftpPort,
            sshKeyPath: backupConfig.sshKeyPath
          })
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching settings:', error)
          setIsLoading(false)
        })
    }
  }, [])
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    window.api.setConfig({
      backupConfig: {
        backupCron: values.backupCron,
        backupFiles: values.backupFiles,
        dayToKeep: 3,
        outputFolder: values.outputFolder,
        sendFile: values.sendFile,
        pathRemote: values.pathRemote,
        sftpUser: values.sftpUser,
        sftpHost: values.sftpHost,
        sftpPort: values.sftpPort,
        sshKeyPath: values.sshKeyPath
      },
      theme: 'dark'
    })

    // window.electron.ipcRenderer.invoke('setSettings', {
    //   backupConfig: {
    //     backupCron: values.backupCron,
    //     backupFiles: values.backupFiles,
    //     dayToKeep: 3,
    //     outputFolder: values.outputFolder,
    //     sendFile: values.sendFile,
    //     pathRemote: values.pathRemote,
    //     sftpUser: values.sftpUser,
    //     sftpHost: values.sftpHost,
    //     sftpPort: values.sftpPort,
    //     sshKeyPath: values.sshKeyPath
    //   },
    //   theme: 'dark'
    // })

    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-[100%] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-['Inter_var',sans-serif]">
        <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg font-semibold text-gray-700">
              Carregando configurações...
            </span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[100%] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-['Inter_var',sans-serif]">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Configurações de Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <BackupFilesSection form={form} />
              <BackupTimeSection form={form} />
              <OutputFolderSection form={form} />
              <RemoteConfigSection form={form} />
              <ActionButtons />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

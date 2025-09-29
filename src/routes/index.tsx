

import { Route, Routes } from 'react-router-dom'


import { DefaultLayout } from '../template/DefaultLayout'
import { Dashboard } from '@pages/Dashboard'
import { Leads } from '@pages/Leads'
import {  Resumes } from '@pages/HR/Resumes'
import Teste from '@pages/Teste/index'
import { SalesDashboard } from '@pages/SalesDashboard'
import { OperationGroup } from '@pages/OperationGroup'
import { Kanban } from '@pages/HR/Kanban'
import { Jobs } from '@pages/HR/Jobs'
import { HrMessagesPage } from '@pages/HR/HrMessages'
import Whatsapp from '@pages/Whatsapp'
import { HrDashboard } from '@pages/HR/Dashboard'



export function Router() {
    return (
        <Routes>
        <Route path = "/" element = {< DefaultLayout />}>
            <Route index  path = "/dashboard"element = {< Dashboard />} />
            <Route path = "/whatsapp"element = {< Whatsapp />} />
            <Route path = "/leads"element = {< Leads />} />
            <Route path = "/resumes"element = {< Resumes/>} />
            <Route path = "/teste"element = {< Teste/>} />
            <Route path = "/sales-dashboard"element = {< SalesDashboard/>} />
            <Route path = "/operation-group"element = {< OperationGroup/>} />
            <Route path = "/kanban-rh"element = {< Kanban/>} />
            <Route path = "/jobs"element = {< Jobs/>} />
            <Route path = "/hr-messages"element = {< HrMessagesPage/>} />
            <Route index  path = "/dashboard-hr"element = {< HrDashboard />} />
            <Route path="/teste/:slug" element={<Teste />} />


        </Route>

</Routes>
  )
}



import { Route, Routes } from 'react-router-dom'



import Teste from '@pages/Teste/index'



export function Router() {
    return (
        <Routes>
                    <Route path="/autenticacao/:slug" element={<Teste />} />



</Routes>
  )
}

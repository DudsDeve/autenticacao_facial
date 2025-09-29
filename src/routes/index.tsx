

import { Route, Routes } from 'react-router-dom'
import Teste from '../pages/index'





export function Router() {
    return (
        <Routes>
          <Route path="/" element={<Teste/>} />

        <Route path="/autenticacao/:slug" element={<Teste/>} />

      

</Routes>
  )
}

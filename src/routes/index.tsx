

import { Route, Routes } from 'react-router-dom'
import Teste from '../pages/index'





export function Router() {
    return (
        <Routes>
          <Route path="/" element={<div>Acesso negado - URL inválida</div>} />

        <Route path="/autenticacao/:slug" element={<Teste/>} />

      

</Routes>
  )
}

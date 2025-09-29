import { useParams } from "react-router-dom";
import BankStyleCamera from "./pages/Autentication"

function App() {
 
  const { slug = '' } = useParams(); // "5531994375739-1758821130980"
  const [tel, ts] = decodeURIComponent(slug).split('-');
  return (
    <>
     <BankStyleCamera initialTelefone={tel || ''}
      initialTimestamp={ts ? Number(ts) : null} />
    </>
  )
}

export default App

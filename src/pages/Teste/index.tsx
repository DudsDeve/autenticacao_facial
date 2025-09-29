import { useParams } from 'react-router-dom';
import CaptureAndUpload from './components/CaptureAndUpload';


export default function Teste() {
  const { slug = '' } = useParams(); // "5531994375739-1758821130980"
  const [tel, ts] = decodeURIComponent(slug).split('-');

  return (
    <CaptureAndUpload
      initialTelefone={tel || ''}
      initialTimestamp={ts ? Number(ts) : null}
    />
  );
}

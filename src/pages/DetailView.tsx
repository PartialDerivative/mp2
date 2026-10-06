import { useParams } from 'react-router-dom';

export default function DetailView() {
  const { id } = useParams();
  return <h1>Detail View — artwork {id}</h1>;
}
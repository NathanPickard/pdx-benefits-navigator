import { AppBar } from '@/components/brand/AppBar';
import { ConversationalForm } from '@/components/intake/ConversationalForm';

export const metadata = {
  title: 'Find your benefits — PDX Benefits Navigator',
};

export default function IntakePage() {
  return (
    <>
      <AppBar />
      <ConversationalForm />
    </>
  );
}

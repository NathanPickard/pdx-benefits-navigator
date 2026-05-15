import { ConversationalForm } from '@/components/intake/ConversationalForm';

export const metadata = {
  title: 'Find your benefits — PDX Benefits Navigator',
};

export default function IntakePage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <ConversationalForm />
    </main>
  );
}

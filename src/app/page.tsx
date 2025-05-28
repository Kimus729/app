import VmQueryForm from '@/components/vm-query-form';
import { DatabaseZap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-3xl">
        <header className="flex items-center space-x-3 mb-8 justify-center">
          <DatabaseZap className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold text-primary">VM Query Tool</h1>
        </header>
        <VmQueryForm />
      </div>
    </div>
  );
}

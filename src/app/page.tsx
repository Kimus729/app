
import VmQueryForm from '@/components/vm-query-form';
import FileHashCalculator from '@/components/file-hash-calculator';
import { DatabaseZap, Hash } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-3xl space-y-12">
        <header className="flex flex-col items-center space-y-2 pt-8 text-center">
          <Hash className="h-12 w-12 text-primary" /> 
          <h1 className="text-4xl font-bold text-primary">MultiversX Dev Tools</h1>
          <p className="text-md text-muted-foreground">A collection of useful tools for MultiversX development.</p>
        </header>
        
        <FileHashCalculator />
        
        <section aria-labelledby="vm-query-tool-heading">
            <div className="flex items-center space-x-3 mb-6 justify-center">
                <DatabaseZap className="h-8 w-8 text-primary" />
                <h2 id="vm-query-tool-heading" className="text-3xl font-semibold text-primary">VM Query Tool</h2>
            </div>
            <VmQueryForm />
        </section>

      </div>
    </div>
  );
}

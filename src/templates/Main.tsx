import type { ReactNode } from 'react';

import Footer from '@/layouts/Footer';

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
  className?: string;
};

const Main = (props: IMainProps) => {
  return (
    <div className="w-full bg-themeGray-5 font-roboto text-gray-700 antialiased dark:bg-dark-25">
      {props.meta}

      <div className="mx-auto w-full">
        <main className="min-h-[calc(100vh-50px)] text-xl">
          {props.children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export { Main };

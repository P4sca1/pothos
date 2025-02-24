import { HTMLProps, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ArrowLeftIcon from '@heroicons/react/outline/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/outline/ArrowRightIcon';
import { MDXProvider } from '@mdx-js/react';
import { Layout } from '../Layout';
import { TableOfContents } from '../Toc';
import Alert from './Alert';
import { Heading } from './Heading';
import { useCurrentDocsPage } from './Nav';
import { Toc } from './Toc';

export interface BaseProps {
  children: ReactNode;
}

const components = {
  a: ({ href, ...props }: HTMLProps<HTMLAnchorElement>) => (
    <Link href={href!}>
      <a {...props} className="dark:!text-white" />
    </Link>
  ),
  img: (props: HTMLProps<HTMLElement>) => <img {...(props as {})} className="mb-16" />,
  p: (props: HTMLProps<HTMLParagraphElement>) => <p {...props} className="dark:!text-white" />,
  h1: (props: HTMLProps<HTMLHeadingElement>) => (
    <Heading tag="h1" {...props} className="dark:!text-white text-3xl" />
  ),
  h2: (props: HTMLProps<HTMLHeadingElement>) => (
    <Heading tag="h2" {...props} className="dark:!text-white text-3xl" />
  ),
  h3: (props: HTMLProps<HTMLHeadingElement>) => (
    <Heading tag="h3" {...props} className="dark:!text-white text-3xl" />
  ),
  h4: (props: HTMLProps<HTMLHeadingElement>) => (
    <Heading tag="h4" {...props} className="dark:!text-white text-3xl" />
  ),
  li: (props: HTMLProps<HTMLLIElement>) => <li {...props} className="dark:!text-white" />,
  strong: (props: HTMLProps<HTMLElement>) => <strong {...props} className="dark:!text-white" />,
  inlineCode: (props: HTMLProps<HTMLElement>) => <code {...props} className="dark:!text-white" />,
  pre: (props: HTMLProps<HTMLElement>) => <pre className="">{props.children}</pre>,
  code: (props: HTMLProps<HTMLElement>) => {
    const match = /language-(\w+)/.exec(props.className ?? '');

    return match ? (
      <code>{props.children}</code>
    ) : (
      <code
        {...props}
        className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded before:content-[''] after:content-[''] px-2 font-semibold inline-block"
      />
    );
  },
  Alert,
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function DocsPage({ children, nav }: { children?: React.ReactNode; nav: TableOfContents }) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<
    {
      url: string;
      depth: number;
      text: string;
    }[]
  >([]);

  useIsomorphicLayoutEffect(() => {
    setItems(
      // eslint-disable-next-line unicorn/prefer-spread
      Array.from(bodyRef.current?.querySelectorAll('h2, h3') ?? []).map((header) => ({
        url: `#${header.id}`,
        depth: Number.parseInt(header.tagName.replace('H', ''), 10) ?? 0,
        text: header.textContent ?? '',
      })),
    );
  }, []);

  const currentPage = useCurrentDocsPage(nav);

  return (
    <Layout toc={nav}>
      <MDXProvider components={components}>
        <Toc
          className="fixed pt-8 top-16 right-4 hidden md:block md:w-[calc(100%-min(816px,75%))] xl:w-[calc(50%-min(416px,37.5%))] bottom-0 overflow-y-auto"
          items={items}
          nav={nav}
          currentPage={currentPage}
        />
        <div ref={bodyRef} className="prose">
          {children}
          <div className="mt-20 flex justify-center space-x-4">
            {currentPage?.prevPage && (
              <Link href={currentPage.prevPage.link}>
                <a className="flex items-center space-x-2 border shadow p-4 text-gray-700 dark:text-gray-200 no-underline hover:shadow-md hover:underline">
                  <ArrowLeftIcon height={22} />
                  <span>{currentPage.prevPage.name}</span>
                </a>
              </Link>
            )}
            {currentPage?.nextPage && (
              <Link href={currentPage.nextPage.link}>
                <a className="flex items-center space-x-2 border shadow p-4 text-gray-700  dark:text-gray-200 no-underline hover:shadow-md hover:underline">
                  <span>{currentPage.nextPage.name}</span>
                  <ArrowRightIcon height={22} />
                </a>
              </Link>
            )}
          </div>
        </div>
      </MDXProvider>
    </Layout>
  );
}

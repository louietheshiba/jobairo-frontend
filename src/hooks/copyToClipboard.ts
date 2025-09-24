import { useState } from 'react';

const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setError(null);

        setTimeout(() => {
          setIsCopied(false);
        }, 1000);
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (err) {
      setIsCopied(false);
      setError(err instanceof Error ? err.message : 'Failed to copy');
    }
  };

  return { copyToClipboard, isCopied, error };
};

export default useCopyToClipboard;

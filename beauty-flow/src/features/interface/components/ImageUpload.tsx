import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { fileService } from '../../../services/fileService';
import { ImageOptimizer, ImageDimensions } from '../../../services/imageOptimizer';

interface ImageUploadProps {
  label: string;
  imageUrl?: string;
  alt: string;
  onUpload: (file: File) => Promise<void>;
  dimensions?: {
    width: number;
    height: number;
  };
  type?: 'logo' | 'banner' | 'image';
}

type Status = { tone: 'ok' | 'info' | 'warn' | 'error'; text: string } | null;

const toneClass = {
  ok: 'text-emerald-700 dark:text-emerald-300',
  info: 'text-gray-600 dark:text-gray-300',
  warn: 'text-amber-700 dark:text-amber-300',
  error: 'text-red-600 dark:text-red-400',
};

const ImageUpload: React.FC<ImageUploadProps> = ({ label, imageUrl, alt, onUpload, dimensions, type = 'image' }) => {
  const { t } = useTranslation('interface');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  // File whose dimensions are off, waiting for the user to accept the automatic resize.
  const [pending, setPending] = useState<{ file: File; text: string } | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await processFile(event.target.files?.[0]);
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const upload = async (file: File) => {
    try {
      await onUpload(file);
    } catch (error) {
      console.error('ImageUpload: erreur lors de l\'envoi de l\'image:', error);
      setStatus({ tone: 'error', text: t('upload.error') });
    }
  };

  const processFile = async (file?: File) => {
    if (!file) return;
    setPending(null);
    setStatus(null);

    // Vérifier la taille du fichier (max 10MB pour permettre l'optimisation)
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ tone: 'error', text: t('upload.too_large') });
      return;
    }
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setStatus({ tone: 'error', text: t('upload.not_image') });
      return;
    }

    setIsProcessing(true);
    try {
      // Si des dimensions sont spécifiées, valider avant l'envoi
      if (dimensions) {
        const validation = await ImageOptimizer.validateImageDimensions(file, dimensions as ImageDimensions, 0.2); // Tolérance de 20%
        if (!validation.isValid) {
          const { width, height } = validation.actualDimensions;
          setPending({
            file,
            text: width
              ? t('upload.wrong_size', { width, height, expectedWidth: dimensions.width, expectedHeight: dimensions.height })
              : t('upload.unreadable'),
          });
          return;
        }
        setStatus({ tone: 'ok', text: t('upload.perfect') });
      }
      await upload(file);
    } catch (error) {
      console.error('ImageUpload: erreur lors du traitement de l\'image:', error);
      setStatus({ tone: 'error', text: t('upload.error') });
    } finally {
      setIsProcessing(false);
    }
  };

  const resizeAndUpload = async () => {
    if (!pending || !dimensions) return;
    const { file } = pending;
    setPending(null);
    setIsProcessing(true);
    try {
      const optimized = await ImageOptimizer.resizeToExactDimensions(file, dimensions as ImageDimensions, 0.98); // Qualité très élevée
      // Créer un nouveau fichier à partir du blob optimisé
      const resized = new File([optimized.blob], file.name, { type: 'image/png', lastModified: Date.now() });
      setStatus({ tone: 'info', text: t('upload.resized', { width: dimensions.width, height: dimensions.height }) });
      await upload(resized);
    } catch (error) {
      console.error('ImageUpload: erreur lors du redimensionnement:', error);
      setStatus({ tone: 'error', text: t('upload.error') });
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelResize = () => {
    setStatus(pending && { tone: 'warn', text: pending.text });
    setPending(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-50">{label}</p>
          {dimensions && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 tabular-nums">
              {t('upload.recommended', { width: dimensions.width, height: dimensions.height })}
            </p>
          )}
        </div>
        <button type="button" onClick={handleClick} disabled={isProcessing} className="btn-secondary shrink-0">
          <PhotoIcon className="size-4" />
          {imageUrl ? t('upload.replace') : t('upload.choose')}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {pending && (
        <div role="alertdialog" aria-labelledby={`${type}-resize-text`} className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/30 dark:bg-amber-500/10">
          <p id={`${type}-resize-text`} className="text-sm text-amber-800 dark:text-amber-200">
            {pending.text} {t('upload.resize_question')}
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={cancelResize} className="btn-ghost">{t('upload.cancel')}</button>
            <button type="button" onClick={resizeAndUpload} className="btn-primary">{t('upload.resize')}</button>
          </div>
        </div>
      )}
      {status && <p role={status.tone === 'error' ? 'alert' : undefined} className={`text-sm ${toneClass[status.tone]}`}>{status.text}</p>}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]); }}
        className={`relative w-full overflow-hidden rounded-xl transition-colors duration-150 ease-out ${type === 'banner' ? 'aspect-[16/5] min-h-32' : 'h-40'} ${
          dragging
            ? 'border-2 border-dashed border-orange-500 bg-orange-50 dark:bg-orange-500/10'
            : imageUrl
            ? 'border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50'
            : 'border-2 border-dashed border-gray-300 dark:border-gray-700'
        }`}
      >
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/85 text-sm text-gray-700 dark:bg-gray-900/85 dark:text-gray-200">
            <span className="size-4 rounded-full border-2 border-gray-300 border-t-orange-500 animate-spin" />
            {t('upload.processing')}
          </div>
        )}

        {imageUrl ? (
          <img
            src={fileService.getImageUrl(imageUrl)}
            alt={alt}
            className={`h-full w-full ${type === 'logo' ? 'object-contain p-4' : 'object-cover'}`}
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-150"
          >
            <PhotoIcon className="size-8 text-gray-400" />
            <span className="text-sm">{t('upload.dropzone')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

import { useState } from 'react';
import { Modal, Button } from '../ui';
import { Employee, generateInviteLink } from '../../services/employeeService';
import { Copy, Check } from 'lucide-react';

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export default function InviteLinkModal({ isOpen, onClose, employee }: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);

  if (!employee) return null;

  const inviteLink = generateInviteLink(employee.invite_token);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ссылка для регистрации" size="md">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20 rounded-xl p-4 border border-orange-200 dark:border-burgundy-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Отправьте эту ссылку сотруднику <strong>{employee.full_name}</strong> для регистрации
            в системе:
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-900 dark:text-white font-mono break-all">
              {inviteLink}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleCopy}
          fullWidth
          className="flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5" />
              Скопировано!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5" />
              Копировать ссылку
            </>
          )}
        </Button>

        <Button variant="secondary" onClick={handleClose} fullWidth>
          Закрыть
        </Button>
      </div>
    </Modal>
  );
}

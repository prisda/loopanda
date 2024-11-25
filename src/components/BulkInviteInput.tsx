import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BulkInviteInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
}

export function BulkInviteInput({ value, onChange, placeholder }: BulkInviteInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setError(null);

    const emails = e.target.value
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const invalidEmails = emails.filter(email => !validateEmail(email));
    
    if (invalidEmails.length > 0) {
      setError(`Invalid email${invalidEmails.length > 1 ? 's' : ''}: ${invalidEmails.join(', ')}`);
    } else {
      onChange(emails);
    }
  };

  const removeEmail = (emailToRemove: string) => {
    onChange(value.filter(email => email !== emailToRemove));
  };

  useEffect(() => {
    if (value.length === 0) {
      setInputValue('');
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <textarea
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="input-primary min-h-[100px]"
      />

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(email => (
            <div
              key={email}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-sm"
            >
              <span>{email}</span>
              <button
                onClick={() => removeEmail(email)}
                className="p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
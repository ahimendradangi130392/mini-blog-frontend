import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usersAPI } from '../../services/api';
import { User } from '../../types';
import { Textarea } from './textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '../../lib/utils';

interface UserMentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (username: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

const UserMentionAutocomplete: React.FC<UserMentionAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Write a comment… Use @username to mention',
  disabled = false,
  maxLength = 500
}) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract mention query from current cursor position
  const extractMentionQuery = useCallback((text: string, position: number) => {
    const beforeCursor = text.slice(0, position);
    const match = beforeCursor.match(/@(\w*)$/);
    return match ? match[1] : '';
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(newPosition);
    
    const query = extractMentionQuery(newValue, newPosition);
    setMentionQuery(query);
    
    if (query && query.length > 0) {
      setOpen(true);
      searchUsers(query);
    } else {
      setOpen(false);
    }
  };

  // Search users
  const searchUsers = async (query: string) => {
    if (query.length < 1) return;
    
    try {
      setLoading(true);
      const results = await usersAPI.searchUsers(query, 8);
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (username: string) => {
    const beforeMention = value.slice(0, cursorPosition - mentionQuery.length - 1);
    const afterMention = value.slice(cursorPosition);
    const newValue = beforeMention + '@' + username + ' ' + afterMention;
    
    onChange(newValue);
    onSelect(username);
    setOpen(false);
    setMentionQuery('');
    
    // Focus back to textarea and set cursor position after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = beforeMention.length + username.length + 2; // +2 for @ and space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mentionQuery && mentionQuery.length > 0) {
        searchUsers(mentionQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [mentionQuery]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="min-h-[80px] resize-none"
          />
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-80 p-0" 
          align="start"
          side="top"
          sideOffset={4}
        >
          <Command>
            <CommandInput 
              placeholder="Search users..." 
              value={mentionQuery}
              onValueChange={setMentionQuery}
            />
            <CommandList>
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  Searching users...
                </div>
              ) : users.length > 0 ? (
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user._id}
                      onSelect={() => handleUserSelect(user.username)}
                      className="flex items-center space-x-3 px-4 py-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          @{user.username}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No users found</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Character count */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
        {value.length}/{maxLength}
      </div>
    </div>
  );
};

export default UserMentionAutocomplete; 

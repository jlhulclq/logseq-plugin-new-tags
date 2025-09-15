import React, { useEffect, useState } from 'react';
import { styled } from 'stitches.config';

const SettingsContainer = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

const SettingsPanel = styled('div', {
  backgroundColor: '$elevation1',
  borderRadius: '$3',
  padding: '$5',
  minWidth: '400px',
  maxWidth: '600px',
  maxHeight: '80vh',
  overflow: 'auto',
  border: '1px solid $slate7',
  '.dark-theme &': {
    backgroundColor: '$slate2',
    border: '1px solid $slate8',
  },
});

const SettingsHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$4',
  paddingBottom: '$3',
  borderBottom: '1px solid $slate6',
});

const SettingsTitle = styled('h2', {
  margin: 0,
  color: '$slate12',
  fontSize: '18px',
  fontWeight: '600',
});

const CloseButton = styled('button', {
  all: 'unset',
  cursor: 'pointer',
  padding: '$2',
  borderRadius: '$2',
  color: '$slate11',
  '&:hover': {
    backgroundColor: '$slate4',
    color: '$slate12',
  },
});

const SettingSection = styled('div', {
  marginBottom: '$4',
});

const SectionTitle = styled('h3', {
  margin: '0 0 $2 0',
  color: '$slate12',
  fontSize: '16px',
  fontWeight: '500',
});

const SectionDescription = styled('p', {
  margin: '0 0 $3 0',
  color: '$slate11',
  fontSize: '14px',
  lineHeight: 1.5,
});

const OptionGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const OptionItem = styled('label', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2',
  borderRadius: '$2',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$slate3',
  },
});

const RadioInput = styled('input', {
  margin: 0,
});

const OptionLabel = styled('div', {
  flex: 1,
});

const OptionTitle = styled('div', {
  color: '$slate12',
  fontSize: '14px',
  fontWeight: '500',
});

const OptionDesc = styled('div', {
  color: '$slate11',
  fontSize: '12px',
  marginTop: '2px',
});

const KeybindingInput = styled('input', {
  all: 'unset',
  padding: '$2 $3',
  borderRadius: '$2',
  border: '1px solid $slate7',
  backgroundColor: '$elevation0',
  color: '$slate12',
  fontSize: '14px',
  fontFamily: 'monospace',
  minWidth: '200px',
  '&:focus': {
    borderColor: '$slate9',
    outline: '2px solid $slate8',
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

const SaveButton = styled('button', {
  all: 'unset',
  padding: '$2 $4',
  borderRadius: '$2',
  backgroundColor: '$slate9',
  color: 'white',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  marginTop: '$4',
  '&:hover': {
    backgroundColor: '$slate10',
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

export interface PluginSettings {
  theme: 'colorful' | 'simple';
  shortcut: string;
}

interface SettingsProps {
  isOpen: boolean;
  settings: PluginSettings;
  onClose: () => void;
  onSave: (settings: PluginSettings) => void;
}

export function Settings({ isOpen, settings, onClose, onSave }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<PluginSettings>(settings);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const keys: string[] = [];
    if (e.ctrlKey || e.metaKey) keys.push(e.metaKey ? 'cmd' : 'ctrl');
    if (e.altKey) keys.push('alt');
    if (e.shiftKey) keys.push('shift');
    
    if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
      keys.push(e.key.toLowerCase());
    }
    
    if (keys.length > 1 || (keys.length === 1 && !['ctrl', 'alt', 'shift', 'cmd'].includes(keys[0]))) {
      setLocalSettings(prev => ({ ...prev, shortcut: keys.join('+') }));
      setIsRecording(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setLocalSettings(prev => ({ ...prev, shortcut: '' }));
  };

  if (!isOpen) return null;

  return (
    <SettingsContainer onClick={onClose}>
      <SettingsPanel onClick={(e) => e.stopPropagation()}>
        <SettingsHeader>
          <SettingsTitle>Tags Plugin Settings / 标签插件设置</SettingsTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </SettingsHeader>

        <SettingSection>
          <SectionTitle>Theme Style / 主题样式</SectionTitle>
          <SectionDescription>
            Choose between colorful theme with vibrant colors or simple theme with minimal styling.
            <br />
            选择彩色主题（多彩背景）或简单主题（极简风格）。
          </SectionDescription>
          <OptionGroup>
            <OptionItem>
              <RadioInput
                type="radio"
                name="theme"
                value="colorful"
                checked={localSettings.theme === 'colorful'}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value as 'colorful' | 'simple' }))}
              />
              <OptionLabel>
                <OptionTitle>Colorful Theme / 彩色主题</OptionTitle>
                <OptionDesc>
                  Tags and buttons with vibrant colors and backgrounds
                  <br />
                  标签和按钮使用多彩背景色
                </OptionDesc>
              </OptionLabel>
            </OptionItem>
            <OptionItem>
              <RadioInput
                type="radio"
                name="theme"
                value="simple"
                checked={localSettings.theme === 'simple'}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value as 'colorful' | 'simple' }))}
              />
              <OptionLabel>
                <OptionTitle>Simple Theme / 简单主题</OptionTitle>
                <OptionDesc>
                  Clean minimal style with monochrome colors, no "TXT" badges
                  <br />
                  简洁极简风格，使用黑白配色，无"TXT"标识
                </OptionDesc>
              </OptionLabel>
            </OptionItem>
          </OptionGroup>
        </SettingSection>

        <SettingSection>
          <SectionTitle>Keyboard Shortcut / 快捷键</SectionTitle>
          <SectionDescription>
            Set a keyboard shortcut to quickly open the tags panel.
            <br />
            设置快捷键以快速打开标签面板。
          </SectionDescription>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <KeybindingInput
              type="text"
              value={isRecording ? 'Press keys...' : localSettings.shortcut}
              placeholder={isRecording ? 'Press keys...' : 'Click to set shortcut'}
              readOnly
              onClick={startRecording}
              onKeyDown={handleKeyDown}
              style={{ 
                cursor: 'pointer',
                fontStyle: isRecording ? 'italic' : 'normal',
                color: isRecording ? '$slate10' : '$slate12'
              }}
            />
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, shortcut: '' }))}
              style={{
                all: 'unset',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '$slate4',
                color: '$slate11',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Clear / 清除
            </button>
          </div>
        </SettingSection>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <SaveButton onClick={onClose} style={{ backgroundColor: '$slate6' }}>
            Cancel / 取消
          </SaveButton>
          <SaveButton onClick={handleSave}>
            Save / 保存
          </SaveButton>
        </div>
      </SettingsPanel>
    </SettingsContainer>
  );
}
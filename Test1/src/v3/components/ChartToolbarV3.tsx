import { Button, Select } from '@innovaccer/design-system';

import type { ChartAction, LegendItem } from '../../types';
import { cx } from '../../utils/cx';
import { Legend } from '../../components/Legend';
import type { V3HeaderProps } from '../types';

interface MasalaOption {
  label: string;
  value: string;
}

const actionIconMap: Record<ChartAction['id'], string> = {
  'save-image': 'save_alt',
  restore: 'settings_backup_restore',
  'line-view': 'show_chart',
  'bar-view': 'bar_chart',
  'data-view': 'table_chart',
  'zoom-in': 'zoom_in',
  'zoom-out': 'zoom_out'
};

export interface ChartToolbarV3Props extends V3HeaderProps {
  legendItems?: LegendItem[];
  className?: string;
}

export function ChartToolbarV3({
  title,
  showTitle = true,
  legendItems = [],
  selectOptions,
  selectedValue,
  onSelectChange,
  actions = [],
  primaryActionLabel,
  onPrimaryActionClick,
  showMenu = false,
  onMenuClick,
  className
}: ChartToolbarV3Props) {
  const selectedOption = selectOptions?.find(
    (option) => option.value === selectedValue
  );

  const handleSelect = (option?: MasalaOption | MasalaOption[]) => {
    if (Array.isArray(option)) {
      onSelectChange?.(`${option[0]?.value ?? ''}`);
      return;
    }

    if (option?.value) {
      onSelectChange?.(`${option.value}`);
    }
  };

  return (
    <header className={cx('cl-header', className)}>
      <div className="cl-header__title-block">
        {showTitle && title ? <h3 className="cl-header__title">{title}</h3> : null}
        {legendItems.length ? <Legend items={legendItems} /> : null}
      </div>
      <div className="cl-header__controls">
        {selectOptions?.length ? (
          <Select
            width={104}
            value={selectedOption}
            onSelect={handleSelect}
            triggerOptions={{
              triggerSize: 'small',
              placeholder: selectOptions[0]?.label ?? 'Select',
              withClearButton: false,
              minWidth: 104
            }}
          >
            <Select.List>
              {selectOptions.map((option) => (
                <Select.Option
                  key={option.value}
                  option={{ label: option.label, value: option.value }}
                >
                  {option.label}
                </Select.Option>
              ))}
            </Select.List>
          </Select>
        ) : null}
        {actions.length ? (
          <div className="cl-header__actions">
            {actions.map((action) => (
              <Button
                key={action.id}
                appearance="transparent"
                type="button"
                size="tiny"
                icon={actionIconMap[action.id]}
                largeIcon
                tooltip={action.label ?? action.id}
                aria-label={action.label ?? action.id}
                onClick={action.onClick}
              />
            ))}
          </div>
        ) : null}
        {primaryActionLabel ? (
          <Button
            appearance="primary"
            type="button"
            size="tiny"
            onClick={onPrimaryActionClick}
          >
            {primaryActionLabel}
          </Button>
        ) : null}
        {showMenu ? (
          <Button
            appearance="transparent"
            type="button"
            size="tiny"
            icon="more_horiz"
            largeIcon
            aria-label="More actions"
            onClick={onMenuClick}
          />
        ) : null}
      </div>
    </header>
  );
}

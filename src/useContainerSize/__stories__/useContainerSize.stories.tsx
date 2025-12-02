import { Meta, StoryFn } from '@storybook/react';
import React, { useMemo, useState } from 'react';
import { useContainerSize } from '../useContainerSize';

export default {
  title: 'Hooks/useContainerSize',
} as Meta;

const Template: StoryFn = () => {
  const [containerWidth, setContainerWidth] = useState(320);
  const [throttleTime, setThrottleTime] = useState(100);
  const [isEnabled, setIsEnabled] = useState(true);
  const [mobileBreakpoint, setMobileBreakpoint] = useState(0);
  const [tabletBreakpoint, setTabletBreakpoint] = useState(768);
  const [desktopBreakpoint, setDesktopBreakpoint] = useState(1200);

  const breakpoints = useMemo(() => {
    return {
      mobile: mobileBreakpoint,
      tablet: tabletBreakpoint,
      desktop: desktopBreakpoint,
    };
  }, [mobileBreakpoint, tabletBreakpoint, desktopBreakpoint]);

  const { ref, size, width } = useContainerSize({
    breakpoints,
    throttleTime,
    isEnabled,
  });

  const handleInputContainerWidthChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContainerWidth(Number(event.target.value));
  };

  const handleInputThrottleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setThrottleTime(Number(event.target.value));
  };

  const handleIsEnabledChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsEnabled(event.target.checked);
  };

  const handleMobileBreakpointChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMobileBreakpoint(Number(event.target.value));
  };

  const handleTabletBreakpointChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTabletBreakpoint(Number(event.target.value));
  };

  const handleDesktopBreakpointChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDesktopBreakpoint(Number(event.target.value));
  };

  return (
    <div style={{ padding: 16, maxWidth: 1200 }}>
      <label style={{ display: 'block', marginBottom: 12 }}>
        Width:
        <input
          type="range"
          min={200}
          max={1900}
          value={containerWidth}
          onChange={handleInputContainerWidthChange}
          style={{ marginLeft: 8, width: 240 }}
        />
        <span style={{ marginLeft: 8 }}>{containerWidth}px</span>
      </label>

      <label style={{ display: 'block', marginBottom: 12 }}>
        Throttle time:
        <input
          type="number"
          min={0}
          value={throttleTime}
          onChange={handleInputThrottleTimeChange}
          style={{ marginLeft: 8, width: 100 }}
        />
        <span style={{ marginLeft: 8 }}>ms</span>
      </label>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={handleIsEnabledChange}
          style={{ marginRight: 8 }}
        />
        <span>Enabled (isEnabled: {isEnabled ? 'true' : 'false'})</span>
      </label>

      <div
        style={{
          marginBottom: 12,
          padding: 12,
          border: '1px solid #ddd',
          borderRadius: 4,
          backgroundColor: '#f9f9f9',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
          Breakpoints (test dynamic changes):
        </p>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Mobile:
          <input
            type="number"
            min={0}
            value={breakpoints.mobile}
            onChange={handleMobileBreakpointChange}
            style={{ marginLeft: 8, width: 80 }}
          />
          <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>px</span>
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Tablet:
          <input
            type="number"
            min={0}
            value={breakpoints.tablet}
            onChange={handleTabletBreakpointChange}
            style={{ marginLeft: 8, width: 80 }}
          />
          <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>px</span>
        </label>
        <label style={{ display: 'block', marginBottom: 0 }}>
          Desktop:
          <input
            type="number"
            min={0}
            value={breakpoints.desktop}
            onChange={handleDesktopBreakpointChange}
            style={{ marginLeft: 8, width: 80 }}
          />
          <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>px</span>
        </label>
      </div>

      <div
        ref={ref}
        style={{
          marginTop: 16,
          width: containerWidth,
          border: '1px solid #ccc',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >
        <p>
          Current breakpoint: <strong>{size ?? 'none'}</strong>
        </p>
        <p>
          Container width: <strong>{width ?? 'N/A'}px</strong>
        </p>
        <p>Resize this box using the slider to see breakpoint changes.</p>
        <p style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          Throttle time: {throttleTime}ms
        </p>
        <p style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          Current breakpoints: mobile={breakpoints.mobile}px, tablet=
          {breakpoints.tablet}px, desktop={breakpoints.desktop}px
        </p>
        <p style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          Hook enabled: <strong>{isEnabled ? 'Yes' : 'No'}</strong>
          {!isEnabled && ' (size and width should be null)'}
        </p>
      </div>
    </div>
  );
};

export const Demo = Template.bind({});
Demo.args = {};

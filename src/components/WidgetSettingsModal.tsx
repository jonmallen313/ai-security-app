import React, { useState, useEffect, useMemo } from 'react';
import { ChromePicker } from 'react-color';
import { useTheme } from '@/hooks/use-theme';
import { Incident } from '@/services/incidents';

interface Widget {
  id: string;
  type: string;
  category: string;
  color?: string;
  settings?: {
    sourceColors?: { [key: string]: string };
    typeColors?: { [key: string]: string };
    severityColors?: { [key: string]: string };
    [key: string]: any;
  };
}

interface WidgetSettingsModalProps {
  widget: Widget;
  onClose: () => void;
  onUpdate: (widget: Widget, settingType: string, key: string, color: string) => void;
  incidents?: Incident[];
}

const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({
  widget,
  onClose,
  onUpdate,
  incidents
}) => {
  const { resolvedTheme } = useTheme()
  const [sourceColors, setSourceColors] = useState<{ [key: string]: string }>(
    widget.settings?.sourceColors || {}
  );
  const [typeColors, setTypeColors] = useState<{ [key: string]: string }>(
    widget.settings?.typeColors || {}
  );
  const [severityColors, setSeverityColors] = useState<{ [key: string]: string }>(
    widget.settings?.severityColors || {}
  );

  useEffect(() => {
    if(incidents){
        const sources = new Set<string>();
        const types = new Set<string>();
        const severities = new Set<string>();

        incidents.forEach((incident: Incident) => {
          sources.add(incident.sourceIp);
          types.add(incident.mitreTechnique);
          severities.add(incident.threatLevel);
        });

        setSourceColors((prev) => {
            const newSourceColors = {...prev};
            sources.forEach(s => {
                if(!(s in newSourceColors)){
                    newSourceColors[s] = "#000000";
                }
            })
            return newSourceColors;
        })
        setTypeColors((prev) => {
            const newTypeColors = {...prev};
            types.forEach(s => {
                if(!(s in newTypeColors)){
                    newTypeColors[s] = "#000000";
                }
            })
            return newTypeColors;
        })
        setSeverityColors((prev) => {
            const newSeverityColors = {...prev};
            severities.forEach(s => {
                if(!(s in newSeverityColors)){
                    newSeverityColors[s] = "#000000";
                }
            })
            return newSeverityColors;
        })
    }
  }, [incidents]);

  const handleColorChange = (
    color: string,
    key: string,
    settingType: 'sourceColors' | 'typeColors' | 'severityColors'
  ) => {
    switch (settingType) {
      case 'sourceColors':
        setSourceColors((prev) => ({ ...prev, [key]: color }));
        break;
      case 'typeColors':
        setTypeColors((prev) => ({ ...prev, [key]: color }));
        break;
      case 'severityColors':
        setSeverityColors((prev) => ({ ...prev, [key]: color }));
        break;
    }
  };

  const handleSave = () => {
    if (Object.keys(sourceColors).length > 0) {
        Object.keys(sourceColors).forEach((key) => {
            onUpdate(widget, 'sourceColors', key, sourceColors[key]);
        })
    }
    if (Object.keys(typeColors).length > 0) {
        Object.keys(typeColors).forEach((key) => {
            onUpdate(widget, 'typeColors', key, typeColors[key]);
        })
    }
    if (Object.keys(severityColors).length > 0) {
        Object.keys(severityColors).forEach((key) => {
            onUpdate(widget, 'severityColors', key, severityColors[key]);
        })
    }

    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center ${resolvedTheme === "dark" ? "dark:bg-gray-900 dark:bg-opacity-50" : ""}`}>
      <div className={`relative rounded-lg p-8 w-1/2 max-w-screen-md ${
        resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          resolvedTheme === "dark" ? "text-white" : "text-black"
        }`}>Widget Settings</h3>
        {Object.keys(sourceColors).length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Source Colors</h4>
              <div className='grid grid-cols-3 gap-4'>
                  {Object.keys(sourceColors).map((key) => (
                    <div key={key}>
                        <div className="text-sm font-medium mb-1">{key}</div>
                        <ChromePicker
                            color={sourceColors[key]}
                            onChangeComplete={(color) =>
                                handleColorChange(color.hex, key, 'sourceColors')
                            }
                        />
                    </div>
                  ))}
              </div>
            </div>
          )}
          {Object.keys(typeColors).length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Type Colors</h4>
              <div className='grid grid-cols-3 gap-4'>
                {Object.keys(typeColors).map((key) => (
                  <div key={key}>
                      <div className="text-sm font-medium mb-1">{key}</div>
                      <ChromePicker
                        color={typeColors[key]}
                        onChangeComplete={(color) =>
                            handleColorChange(color.hex, key, 'typeColors')
                        }
                      />
                  </div>
                ))}
              </div>
            </div>
          )}
          {Object.keys(severityColors).length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Severity Colors</h4>
              <div className='grid grid-cols-3 gap-4'>
                {Object.keys(severityColors).map((key) => (
                  <div key={key}>
                      <div className="text-sm font-medium mb-1">{key}</div>
                      <ChromePicker
                        color={severityColors[key]}
                        onChangeComplete={(color) =>
                            handleColorChange(color.hex, key, 'severityColors')
                        }
                      />
                  </div>
                ))}
              </div>
            </div>
          )}
        <div className="flex justify-end">
          <button
            className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSettingsModal;
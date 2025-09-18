# Rotas de Sensores - Estruturas para Frontend

## 🔧 Sensores Analógicos

### Criar Sensor Analógico

**POST** `/api/sensors`

```json
{
  "name": "Nome do Sensor Analógico",
  "minScale": 0,
  "maxScale": 100,
  "minAlarm": 10,
  "maxAlarm": 90,
  "gain": 1.0,
  "inputMode": "Voltage",
  "entry": 1,
  "ix": 0,
  "gaugeColor": "#00FF00",
  "offset": 0,
  "alarmTimeout": 30,
  "counterName": null,
  "frequencyCounterName": null,
  "speedSource": false,
  "interruptTransition": null,
  "timeUnit": "ms",
  "speedUnit": "RPM",
  "samplingInterval": 1000,
  "minimumPeriod": 0.1,
  "maximumPeriod": 10.0,
  "frequencyResolution": 0.01,
  "sensorType": 0,
  "measurementUnitId": "uuid-da-unidade-medida",
  "moduleId": "uuid-do-modulo"
}
```

### Atualizar Sensor Analógico

**PUT** `/api/sensors/{id}`

```json
{
  "name": "Nome Atualizado",
  "minScale": 0,
  "maxScale": 200,
  "minAlarm": 20,
  "maxAlarm": 180,
  "gain": 2.0,
  "inputMode": "Current",
  "entry": 2,
  "ix": 1,
  "gaugeColor": "#FF0000",
  "offset": 5,
  "alarmTimeout": 60,
  "counterName": null,
  "frequencyCounterName": null,
  "speedSource": false,
  "interruptTransition": null,
  "timeUnit": "s",
  "speedUnit": "Hz",
  "samplingInterval": 500,
  "minimumPeriod": 0.05,
  "maximumPeriod": 5.0,
  "frequencyResolution": 0.005
}
```

---

## 🔢 Sensores Digitais

### Criar Sensor Digital

**POST** `/api/sensors`

```json
{
  "name": "Nome do Sensor Digital",
  "minScale": 0,
  "maxScale": 1,
  "minAlarm": 0,
  "maxAlarm": 1,
  "gain": null,
  "inputMode": null,
  "entry": 0,
  "ix": null,
  "gaugeColor": null,
  "offset": null,
  "alarmTimeout": null,
  "counterName": "Nome do Contador",
  "frequencyCounterName": "Nome do Contador de Frequência",
  "speedSource": true,
  "interruptTransition": "both",
  "timeUnit": "seconds",
  "speedUnit": "m/s",
  "samplingInterval": 1000,
  "minimumPeriod": 10,
  "maximumPeriod": 100,
  "frequencyResolution": 10,
  "sensorType": 1,
  "measurementUnitId": "uuid-da-unidade-medida",
  "moduleId": "uuid-do-modulo"
}
```

### Atualizar Sensor Digital

**PUT** `/api/sensors/{id}`

```json
{
  "name": "Nome Atualizado",
  "minScale": 0,
  "maxScale": 1,
  "minAlarm": 0,
  "maxAlarm": 1,
  "gain": null,
  "inputMode": null,
  "entry": 0,
  "ix": null,
  "gaugeColor": null,
  "offset": null,
  "alarmTimeout": null,
  "counterName": "Contador Atualizado",
  "frequencyCounterName": "Frequência Atualizada",
  "speedSource": true,
  "interruptTransition": "rising",
  "timeUnit": "minutes",
  "speedUnit": "km/h",
  "samplingInterval": 2000,
  "minimumPeriod": 5,
  "maximumPeriod": 50,
  "frequencyResolution": 5
}
```

---

## 📝 Notas Importantes

- **sensorType**: `0` para analógico, `1` para digital
- **Campos obrigatórios**: `name`, `sensorType`, `measurementUnitId`, `moduleId`
- **Campos opcionais**: Podem ser `null` ou omitidos
- **Headers**: Incluir `Authorization: Bearer {token}` e `Content-Type: application/json`

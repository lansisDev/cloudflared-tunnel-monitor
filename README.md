# Cloudflare Tunnel Monitor

Una aplicación TypeScript/Node.js que monitorea el estado de uno o múltiples túneles de Cloudflare cada 5 minutos y envía notificaciones a Telegram cuando algún túnel no está disponible.

## 🚀 Características

- ⏰ **Monitoreo automático**: Verifica el estado de los túneles cada 5 minutos (configurable)
- � **Múltiples túneles**: Monitorea varios túneles simultáneamente
- �📱 **Notificaciones Telegram**: Alertas inmediatas cuando un túnel se cae o se recupera
- 📊 **Logging detallado**: Registro completo de todas las verificaciones y eventos
- 🔧 **Altamente configurable**: Personaliza URLs, intervalos y timeouts
- 🛡️ **Robusto**: Manejo de errores y reintentos automáticos

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn
- Un bot de Telegram configurado
- Túnel(es) de Cloudflare activo(s)

## 🛠️ Instalación

1. **Clona el repositorio** (si no lo tienes ya)
   ```bash
   git clone <tu-repo>
   cd cloudflare-tunnel-monitor
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```

4. **Edita el archivo `.env`** con tus datos:

### Configuración para múltiples túneles (recomendado):
   ```env
   # Múltiples túneles en formato JSON
   TUNNELS=[
     {"name":"Dokploy VPS 1","url":"https://dokploy-vps-1.lansis.com.ar/"},
     {"name":"App Production","url":"https://app.midominio.com/"},
     {"name":"API Server","url":"https://api.midominio.com/"}
   ]
   
   TELEGRAM_BOT_TOKEN=tu_bot_token_aqui
   TELEGRAM_CHAT_ID=tu_chat_id_aqui
   CHECK_INTERVAL_MINUTES=5
   TIMEOUT_MS=10000
   ```

### Configuración para un solo túnel (compatibilidad):
   ```env
   TUNNEL_URL=https://tu-tunnel-url.trycloudflare.com
   TELEGRAM_BOT_TOKEN=tu_bot_token_aqui
   TELEGRAM_CHAT_ID=tu_chat_id_aqui
   CHECK_INTERVAL_MINUTES=5
   TIMEOUT_MS=10000
   ```

## 🤖 Configuración de Telegram Bot

### Crear un Bot de Telegram

1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot` y sigue las instrucciones
3. Copia el **token** que te proporciona
4. Pega el token en `TELEGRAM_BOT_TOKEN` en tu archivo `.env`

### Obtener tu Chat ID

1. Envía un mensaje a tu bot
2. Visita: `https://api.telegram.org/bot<TU_BOT_TOKEN>/getUpdates`
3. Busca el `chat.id` en la respuesta JSON
4. Pega el chat ID en `TELEGRAM_CHAT_ID` en tu archivo `.env`

## 🏃‍♂️ Uso

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm run build
npm start
```

### Scripts Disponibles

- `npm run build` - Compila TypeScript a JavaScript
- `npm run start` - Ejecuta la aplicación compilada
- `npm run dev` - Ejecuta en modo desarrollo con ts-node
- `npm run watch` - Compila TypeScript en modo watch
- `npm run clean` - Limpia el directorio dist

## 📁 Estructura del Proyecto

```
src/
├── index.ts              # Punto de entrada principal
├── config.ts             # Configuración y validación
├── types.ts              # Definiciones de tipos TypeScript
├── tunnel-monitor.ts     # Lógica de monitoreo del túnel
├── telegram-notifier.ts  # Cliente de notificaciones Telegram
└── logger.ts             # Configuración de logging
```

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Requerido | Ejemplo |
|----------|-------------|-----------|---------|
| `TUNNELS` | Array JSON con configuración de túneles | ✅ (o TUNNEL_URL) | `[{"name":"Mi App","url":"https://..."}]` |
| `TUNNEL_URL` | URL de un túnel (compatibilidad) | ✅ (o TUNNELS) | `https://mi-app.trycloudflare.com` |
| `TELEGRAM_BOT_TOKEN` | Token de tu bot de Telegram | ✅ | `1234567890:ABCdefGhijKlmnOpQrsTuvWxyz` |
| `TELEGRAM_CHAT_ID` | ID del chat donde enviar notificaciones | ✅ | `123456789` |
| `CHECK_INTERVAL_MINUTES` | Intervalo de verificación en minutos | ❌ | `5` (default) |
| `TIMEOUT_MS` | Timeout para requests HTTP en milisegundos | ❌ | `10000` (default) |

### Formato de TUNNELS

La variable `TUNNELS` debe ser un array JSON válido:

```json
[
  {
    "name": "Nombre descriptivo del túnel",
    "url": "https://url-completa-del-tunel.com/"
  },
  {
    "name": "Otro túnel",
    "url": "https://otro-tunel.ejemplo.com/"
  }
]
```

**Importante**: 
- Si defines `TUNNELS`, se ignorará `TUNNEL_URL`
- Si no defines `TUNNELS`, se usará `TUNNEL_URL` para compatibilidad
- Cada túnel debe tener un `name` único y una `url` válida

## 🔧 Personalización

### Cambiar el Intervalo de Monitoreo

Modifica `CHECK_INTERVAL_MINUTES` en tu archivo `.env`:
```env
CHECK_INTERVAL_MINUTES=10  # Verificar cada 10 minutos
```

### Personalizar Mensajes de Telegram

Edita los métodos en `src/telegram-notifier.ts`:
- `sendTunnelDownAlert()` - Mensaje cuando el túnel se cae
- `sendTunnelRecoveredAlert()` - Mensaje cuando el túnel se recupera

### Agregar Más Verificaciones

Puedes extender `TunnelMonitor` para verificar:
- Múltiples endpoints
- Códigos de estado específicos
- Contenido de la respuesta
- Certificados SSL

## 🚀 Despliegue

### Como Servicio de Sistema (Linux/macOS)

1. **Crea un archivo de servicio** (systemd en Linux):
   ```bash
   sudo nano /etc/systemd/system/tunnel-monitor.service
   ```

2. **Configura el servicio**:
   ```ini
   [Unit]
   Description=Cloudflare Tunnel Monitor
   After=network.target

   [Service]
   Type=simple
   User=tu-usuario
   WorkingDirectory=/ruta/a/tu/proyecto
   ExecStart=/usr/bin/node dist/index.js
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. **Habilita e inicia el servicio**:
   ```bash
   sudo systemctl enable tunnel-monitor
   sudo systemctl start tunnel-monitor
   ```

### Con PM2

```bash
npm install -g pm2
pm2 start dist/index.js --name tunnel-monitor
pm2 startup
pm2 save
```

### Con Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## 📊 Logging

Los logs se guardan en:
- `combined.log` - Todos los logs
- `error.log` - Solo errores
- Console - Output en tiempo real

Formato de logs:
```json
{
  "level": "info",
  "message": "✅ Tunnel is online (234ms)",
  "service": "tunnel-monitor",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🛠️ Desarrollo

### Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

### Testing

```bash
# Ejecutar verificación única
npm run dev

# Verificar configuración
node -e "require('./dist/config').validateConfig(require('./dist/config').config)"
```

## 🐛 Solución de Problemas

### Error: "Configuration errors"
- Verifica que todas las variables requeridas estén en tu archivo `.env`
- Asegúrate de que el archivo `.env` esté en el directorio raíz

### El bot no envía mensajes
- Verifica que el token del bot sea correcto
- Asegúrate de haber iniciado una conversación con el bot
- Confirma que el chat ID sea el correcto

### Errores de conexión
- Verifica que la URL del túnel sea accesible
- Comprueba tu conexión a internet
- Ajusta el `TIMEOUT_MS` si es necesario

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

Tu nombre - [tu@email.com]

---

¿Necesitas ayuda? Abre un [issue](../../issues) en GitHub.

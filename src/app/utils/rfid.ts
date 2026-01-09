// src/app/utils/rfid.ts
// Utilidades para interactuar con el lector RFID USB 13.56 MHz 14443a NFC
// 
// COMPATIBILIDAD:
// - Funciona con lectores RFID/NFC USB que se comuniquen vía puerto serial
// - Requiere navegadores Chrome, Edge u Opera (Web Serial API)
// - Soporta formatos: hexadecimal, decimal, con/sin separadores
//
// CONFIGURACIÓN POR DISPOSITIVO:
// - Ajusta baudRate (línea 35): 9600, 19200, 38400, 115200 según tu dispositivo
// - Algunos lectores requieren comandos específicos (descomentar línea 114)
// - Verifica el formato de salida de tu dispositivo en la consola del navegador

let serialPort: SerialPort | null = null;
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
let isReading = false;

/**
 * Conecta con el lector RFID a través de Web Serial API
 * @returns {Promise<{success: boolean; error?: string; connected?: boolean}>}
 */
export async function connectRFIDReader(): Promise<{ success: boolean; error?: string; connected?: boolean }> {
  try {
    // Verificar si el navegador soporta Web Serial API
    if (!('serial' in navigator)) {
      return {
        success: false,
        error: 'Tu navegador no soporta Web Serial API. Usa Chrome, Edge o Opera.'
      };
    }

    // Solicitar acceso al puerto serial
    const port = await (navigator as any).serial.requestPort({
      filters: [
        // Filtros comunes para lectores RFID USB
        { usbVendorId: 0x10c4 }, // Silicon Labs
        { usbVendorId: 0x0403 }, // FTDI
        { usbVendorId: 0x1a86 }, // CH340
      ]
    });

    // Configurar el puerto (ajustar según tu dispositivo)
    // Velocidades comunes: 9600, 19200, 38400, 115200
    await port.open({
      baudRate: 9600, // Velocidad común para lectores RFID (ajustar si es necesario)
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none'
    });

    serialPort = port;
    console.log('Lector RFID conectado exitosamente');

    return { success: true, connected: true };
  } catch (error: any) {
    console.error('Error conectando lector RFID:', error);
    
    if (error.name === 'NotFoundError') {
      return {
        success: false,
        error: 'No se encontró ningún lector RFID. Asegúrate de que esté conectado.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Error desconocido al conectar con el lector RFID'
    };
  }
}

/**
 * Desconecta el lector RFID
 */
export async function disconnectRFIDReader(): Promise<void> {
  try {
    if (reader) {
      await reader.cancel();
      reader = null;
    }
    if (serialPort) {
      await serialPort.close();
      serialPort = null;
    }
    isReading = false;
    console.log('Lector RFID desconectado');
  } catch (error) {
    console.error('Error desconectando lector RFID:', error);
  }
}

/**
 * Lee una tarjeta RFID/NFC
 * @returns {Promise<{success: boolean; cardId?: string; error?: string}>}
 */
export async function readRFIDCard(): Promise<{ success: boolean; cardId?: string; error?: string }> {
  if (!serialPort) {
    return {
      success: false,
      error: 'El lector RFID no está conectado. Por favor, conéctalo primero.'
    };
  }

  if (isReading) {
    return {
      success: false,
      error: 'Ya se está leyendo una tarjeta. Espera a que termine.'
    };
  }

  try {
    isReading = true;

    // Crear un lector de stream
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    
    // Enviar comando para leer tarjeta (ajustar según tu dispositivo)
    // Muchos lectores RFID envían automáticamente el ID cuando detectan una tarjeta
    const writer = serialPort.writable?.getWriter();
    
    if (writer) {
      // Comando común para solicitar lectura (puede variar según el modelo)
      // Algunos lectores envían automáticamente el ID sin comando
      // await writer.write(encoder.encode('\r\n')); // Comando de lectura
      writer.releaseLock();
    }

    // Leer datos del puerto serial
    reader = serialPort.readable?.getReader();
    
    if (!reader) {
      isReading = false;
      return {
        success: false,
        error: 'No se pudo crear el lector del puerto serial'
      };
    }

    // Esperar a leer el ID de la tarjeta
    // Los lectores RFID suelen enviar el ID en formato hexadecimal
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        isReading = false;
        if (reader) {
          reader.releaseLock();
          reader = null;
        }
        resolve({
          success: false,
          error: 'Tiempo de espera agotado. Acerca la tarjeta al lector e intenta de nuevo.'
        });
      }, 10000); // 10 segundos de timeout

      const readData = async () => {
        try {
          while (true) {
            const { value, done } = await reader!.read();
            
            if (done) {
              clearTimeout(timeout);
              isReading = false;
              reader.releaseLock();
              reader = null;
              resolve({
                success: false,
                error: 'Conexión cerrada inesperadamente'
              });
              break;
            }

            if (value) {
              // Decodificar los datos recibidos
              const data = decoder.decode(value);
              
              console.log('Datos recibidos del lector RFID:', data);
              
              // Limpiar y extraer el ID de la tarjeta
              // Los lectores RFID pueden enviar el ID en diferentes formatos:
              // - Hexadecimal: "12345678", "ABCD1234", "Card ID: 12345678\r\n"
              // - Decimal: "12345678", "Tag: 12345678\r\n"
              // - Con prefijos/sufijos: "UID: 12:34:56:78", "Tag=12345678"
              
              // Intentar diferentes patrones para extraer el ID
              let cardId: string | null = null;
              
              // Patrón 1: Hexadecimal puro (4-16 caracteres)
              let match = data.match(/([0-9A-Fa-f]{4,16})\b/);
              if (match) {
                cardId = match[1].toUpperCase();
              } else {
                // Patrón 2: Decimal puro (4-16 dígitos)
                match = data.match(/(\d{4,16})\b/);
                if (match) {
                  cardId = match[1];
                } else {
                  // Patrón 3: Formato con separadores (ej: "12:34:56:78" o "12-34-56-78")
                  match = data.match(/([0-9A-Fa-f]{2}[:-]){3,7}[0-9A-Fa-f]{2}/i);
                  if (match) {
                    // Remover separadores
                    cardId = match[0].replace(/[:-]/g, '').toUpperCase();
                  } else {
                    // Patrón 4: Cualquier secuencia de números y letras hex (más flexible)
                    match = data.match(/[0-9A-Fa-f]{6,}/i);
                    if (match) {
                      cardId = match[0].toUpperCase();
                    }
                  }
                }
              }
              
              if (cardId && cardId.length >= 4) {
                clearTimeout(timeout);
                isReading = false;
                reader.releaseLock();
                reader = null;
                
                console.log('Tarjeta RFID leída:', cardId);
                resolve({
                  success: true,
                  cardId: cardId
                });
                break;
              }
            }
          }
        } catch (error: any) {
          clearTimeout(timeout);
          isReading = false;
          if (reader) {
            reader.releaseLock();
            reader = null;
          }
          resolve({
            success: false,
            error: error.message || 'Error leyendo la tarjeta'
          });
        }
      };

      readData();
    });
  } catch (error: any) {
    isReading = false;
    if (reader) {
      reader.releaseLock();
      reader = null;
    }
    return {
      success: false,
      error: error.message || 'Error desconocido al leer la tarjeta'
    };
  }
}

/**
 * Verifica si el lector RFID está conectado
 */
export function isRFIDReaderConnected(): boolean {
  return serialPort !== null && serialPort.readable !== null;
}

/**
 * Inicia la lectura continua de tarjetas (para el control de asistencia)
 * @param onCardRead Callback que se ejecuta cuando se lee una tarjeta
 */
export async function startContinuousReading(
  onCardRead: (cardId: string) => void
): Promise<{ success: boolean; error?: string }> {
  if (!serialPort) {
    return {
      success: false,
      error: 'El lector RFID no está conectado'
    };
  }

  try {
    const decoder = new TextDecoder();
    reader = serialPort.readable?.getReader();

    if (!reader) {
      return {
        success: false,
        error: 'No se pudo crear el lector del puerto serial'
      };
    }

    // Leer continuamente
    const readLoop = async () => {
      try {
        while (true) {
          const { value, done } = await reader!.read();
          
          if (done) {
            break;
          }

          if (value) {
            const data = decoder.decode(value);
            console.log('Datos recibidos (lectura continua):', data);
            
            // Intentar diferentes patrones para extraer el ID
            let cardId: string | null = null;
            
            // Patrón 1: Hexadecimal puro
            let match = data.match(/([0-9A-Fa-f]{4,16})\b/);
            if (match) {
              cardId = match[1].toUpperCase();
            } else {
              // Patrón 2: Decimal puro
              match = data.match(/(\d{4,16})\b/);
              if (match) {
                cardId = match[1];
              } else {
                // Patrón 3: Formato con separadores
                match = data.match(/([0-9A-Fa-f]{2}[:-]){3,7}[0-9A-Fa-f]{2}/i);
                if (match) {
                  cardId = match[0].replace(/[:-]/g, '').toUpperCase();
                } else {
                  // Patrón 4: Cualquier secuencia hex
                  match = data.match(/[0-9A-Fa-f]{6,}/i);
                  if (match) {
                    cardId = match[0].toUpperCase();
                  }
                }
              }
            }
            
            if (cardId && cardId.length >= 4) {
              onCardRead(cardId);
            }
          }
        }
      } catch (error) {
        console.error('Error en lectura continua:', error);
      }
    };

    readLoop();

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error iniciando lectura continua'
    };
  }
}

/**
 * Detiene la lectura continua
 */
export async function stopContinuousReading(): Promise<void> {
  if (reader) {
    await reader.cancel();
    reader.releaseLock();
    reader = null;
  }
}

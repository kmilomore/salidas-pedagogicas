// ============================================================
// SLEP Colchagua — Notificador de salidas pedagógicas
// Desplegar como: Ejecutar como "Yo" · Acceso "Cualquier persona"
// ============================================================

var CC_EMAILS    = [
  "emma.diaz@slepcolchagua.cl",
  "camilo.serra@slepcolchagua.cl"
];
var SENDER_NAME  = "Portal SLEP Colchagua";

// Protección mínima: el cliente debe enviar este valor en el campo "secret".
// Configúralo igual en APPS_SCRIPT_WEBHOOK_SECRET de tu .env.local
var WEBHOOK_SECRET = "31313ad954fc65d7a1e8f0b45613766094a8d8621c540459f0d35573bb7d95e1";

// ------------------------------------------------------------
// Punto de entrada principal
// ------------------------------------------------------------
function doPost(e) {
  try {
    var raw = JSON.parse(e.postData.contents);

    if (WEBHOOK_SECRET && raw.secret !== WEBHOOK_SECRET) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    var directorEmail      = raw.directorEmail;
    var schoolName         = raw.schoolName         || "Establecimiento";
    var rbd                = raw.rbd                || "";
    var fecha              = raw.fecha              || "";
    var actividad          = raw.actividad          || "";
    var destino            = raw.destino            || "";
    var distanciaKm        = raw.distanciaKm        || 0;
    var cantEstudiantes    = raw.cantidadEstudiantes || 0;
    var cantApoderados     = raw.cantidadApoderados  || 0;
    var tripId             = raw.tripId             || "";
    var pdfBase64          = raw.pdfBase64          || "";

    if (!directorEmail) {
      return jsonResponse({ ok: false, error: "directorEmail requerido" });
    }

    var subject   = buildSubject(schoolName, fecha);
    var plainBody = buildPlainBody(schoolName, rbd, fecha, actividad, destino, distanciaKm, cantEstudiantes, cantApoderados, tripId);
    var htmlBody  = buildHtmlBody(schoolName, rbd, fecha, actividad, destino, distanciaKm, cantEstudiantes, cantApoderados, tripId);

    var options = {
      cc:          CC_EMAILS.join(","),
      htmlBody:    htmlBody,
      name:        SENDER_NAME,
    };

    if (pdfBase64) {
      var pdfBlob = Utilities.newBlob(
        Utilities.base64Decode(pdfBase64),
        "application/pdf",
        "comprobante-salida-" + rbd + "-" + fecha + ".pdf"
      );
      options.attachments = [pdfBlob];
    }

    GmailApp.sendEmail(directorEmail, subject, plainBody, options);

    return jsonResponse({ ok: true });

  } catch (err) {
    Logger.log("Error en doPost: " + err.toString());
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

// ------------------------------------------------------------
// Asunto
// ------------------------------------------------------------
function buildSubject(schoolName, fecha) {
  return "[SLEP Colchagua] Postulación de salida pedagógica registrada – " + schoolName + " – " + formatDate(fecha);
}

// ------------------------------------------------------------
// Cuerpo texto plano (fallback)
// ------------------------------------------------------------
function buildPlainBody(schoolName, rbd, fecha, actividad, destino, distanciaKm, cantEstudiantes, cantApoderados, tripId) {
  return [
    "Estimado/a director/a,",
    "",
    "Le informamos que se ha registrado una postulación de salida pedagógica en el Portal SLEP Colchagua.",
    "",
    "DATOS DE LA POSTULACIÓN",
    "──────────────────────",
    "Establecimiento : " + schoolName + " (RBD " + rbd + ")",
    "Fecha           : " + formatDate(fecha),
    "Actividad       : " + actividad,
    "Destino         : " + destino,
    "Distancia total : " + distanciaKm + " km",
    "Estudiantes     : " + cantEstudiantes,
    "Apoderados      : " + cantApoderados,
    "ID de registro  : " + tripId,
    "",
    "IMPORTANTE – ESTO ES UNA POSTULACIÓN, NO UNA CONFIRMACIÓN",
    "──────────────────────────────────────────────────────────",
    "El registro de esta solicitud no autoriza ni confirma la realización",
    "de la salida pedagógica. La postulación se encuentra en evaluación de",
    "factibilidad presupuestaria. Una vez que contemos con claridad",
    "operativa, nos comunicaremos con usted.",
    "",
    "Se adjunta el comprobante PDF con el detalle completo del recorrido.",
    "",
    "Atentamente,",
    "Equipo SLEP Colchagua",
  ].join("\n");
}

// ------------------------------------------------------------
// Cuerpo HTML
// ------------------------------------------------------------
function buildHtmlBody(schoolName, rbd, fecha, actividad, destino, distanciaKm, cantEstudiantes, cantApoderados, tripId) {
  var rows = [
    ["Establecimiento", schoolName + " <span style='color:#64748b;font-size:13px'>(RBD " + rbd + ")</span>"],
    ["Fecha",           formatDate(fecha)],
    ["Actividad",       actividad],
    ["Destino",         destino],
    ["Distancia total", distanciaKm + " km"],
    ["Estudiantes",     cantEstudiantes],
    ["Apoderados",      cantApoderados],
    ["ID de registro",  "<span style='font-family:monospace;font-size:12px;color:#475569'>" + tripId + "</span>"],
  ];

  var tableRows = rows.map(function(row) {
    return (
      "<tr>" +
        "<td style='padding:10px 16px;font-size:13px;font-weight:600;color:#475569;background:#f8fafc;border-bottom:1px solid #e2e8f0;white-space:nowrap;width:160px'>" + row[0] + "</td>" +
        "<td style='padding:10px 16px;font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0'>" + row[1] + "</td>" +
      "</tr>"
    );
  }).join("");

  return (
    "<!DOCTYPE html>" +
    "<html lang='es'><head><meta charset='UTF-8'></head>" +
    "<body style='margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif'>" +

    // Wrapper
    "<table width='100%' cellpadding='0' cellspacing='0' border='0'>" +
    "<tr><td align='center' style='padding:40px 16px'>" +

    // Card
    "<table width='600' cellpadding='0' cellspacing='0' border='0' style='background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)'>" +

    // Header
    "<tr><td style='background:#0f4c81;padding:32px 40px'>" +
      "<p style='margin:0;font-size:11px;font-weight:700;letter-spacing:.2em;color:#93c5fd;text-transform:uppercase'>Portal institucional</p>" +
      "<h1 style='margin:8px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3'>Postulación de salida<br>pedagógica registrada</h1>" +
    "</td></tr>" +

    // Saludo
    "<tr><td style='padding:32px 40px 0'>" +
      "<p style='margin:0;font-size:15px;color:#334155;line-height:1.6'>Estimado/a director/a,</p>" +
      "<p style='margin:12px 0 0;font-size:15px;color:#334155;line-height:1.6'>Le informamos que se ha registrado la siguiente postulación de salida pedagógica en el Portal SLEP Colchagua.</p>" +
    "</td></tr>" +

    // Tabla de datos
    "<tr><td style='padding:24px 40px 0'>" +
      "<p style='margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:.18em;color:#64748b;text-transform:uppercase'>Datos de la postulación</p>" +
      "<table width='100%' cellpadding='0' cellspacing='0' border='0' style='border-radius:12px;overflow:hidden;border:1px solid #e2e8f0'>" +
        tableRows +
      "</table>" +
    "</td></tr>" +

    // Aviso importante
    "<tr><td style='padding:24px 40px 0'>" +
      "<table width='100%' cellpadding='0' cellspacing='0' border='0' style='background:#fef9c3;border:1px solid #fde047;border-radius:12px'>" +
      "<tr><td style='padding:20px 24px'>" +
        "<p style='margin:0;font-size:12px;font-weight:700;letter-spacing:.16em;color:#854d0e;text-transform:uppercase'>Importante — Esto es una postulación, no una confirmación</p>" +
        "<p style='margin:10px 0 0;font-size:14px;color:#713f12;line-height:1.65'>" +
          "El registro de esta solicitud <strong>no autoriza ni confirma</strong> la realización de la salida pedagógica. " +
          "La postulación se encuentra en evaluación de factibilidad presupuestaria. " +
          "Una vez que contemos con claridad operativa, <strong>nos comunicaremos con usted</strong>." +
        "</p>" +
      "</td></tr>" +
      "</table>" +
    "</td></tr>" +

    // Pie
    "<tr><td style='padding:24px 40px 32px'>" +
      "<p style='margin:0;font-size:13px;color:#64748b;line-height:1.6'>Se adjunta el comprobante PDF con el detalle completo del recorrido y la información registrada.</p>" +
      "<p style='margin:20px 0 0;font-size:13px;color:#94a3b8'>Atentamente,<br><strong style='color:#475569'>Equipo SLEP Colchagua</strong></p>" +
    "</td></tr>" +

    // Footer del card
    "<tr><td style='background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0'>" +
      "<p style='margin:0;font-size:11px;color:#94a3b8;text-align:center'>Este mensaje fue generado automáticamente por el Portal de Salidas Pedagógicas · SLEP Colchagua</p>" +
    "</td></tr>" +

    "</table>" + // end card
    "</td></tr></table>" + // end wrapper
    "</body></html>"
  );
}

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return "";
  var parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  var months = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];
  return parseInt(parts[2], 10) + " de " + months[parseInt(parts[1], 10) - 1] + " de " + parts[0];
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

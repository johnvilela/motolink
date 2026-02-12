import dayjs from "dayjs";

const WHATSAPP_ENDPOINT =
  "https://n8n-lk0sscsw44ok4ow8o0kk0o48.72.60.49.4.sslip.io/webhook/send-messages";

function normalizePhoneNumber(phone: string): string {
  return phone.startsWith("55") ? phone : `55${phone}`;
}

interface WorkShiftInviteData {
  deliverymanName: string;
  clientName: string;
  clientAddress: string;
  shiftDate: Date | string;
  startTime: Date | string;
  endTime: Date | string;
  confirmationUrl: string;
}

interface UsersInviteData {
  token: string;
  name?: string;
}

export function whatsapp() {
  async function sendMessage(
    targetNumber: string,
    nome: string,
    mensagem: string,
  ) {
    const telefone = normalizePhoneNumber(targetNumber);

    const response = await fetch(WHATSAPP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "motolink-api-token": process.env.WHATSAPP_TOKEN || "",
      },
      body: JSON.stringify({
        messages: [{ nome, telefone, mensagem }],
      }),
    });

    return response;
  }

  return {
    async workShiftInvite(targetNumber: string, data: WorkShiftInviteData) {
      const formattedDate = dayjs(data.shiftDate).format("DD/MM/YYYY");
      const shiftPeriod = `${dayjs(data.startTime).format("HH:mm")} às ${dayjs(data.endTime).format("HH:mm")}`;

      const mensagem = `👋🏻 Olá, ${data.deliverymanName}, você foi convocado para uma escala de prestação de serviço na modalidade entrega no dia *${formattedDate}*.  Gostaria de participar?\n
📄 Informações da Escala:\n
Data: ${formattedDate}
Cliente: ${data.clientName}
Motoboy: ${data.deliverymanName}
Endereço: ${data.clientAddress}
Escala: ${shiftPeriod}
\n
Caso tenha interesse, você poderá aceitar ou recusar livremente por meio do link abaixo:\n
👉 ${data.confirmationUrl}`;

      return sendMessage(targetNumber, data.deliverymanName, mensagem);
    },

    async usersInvite(targetNumber: string, data: UsersInviteData) {
      const mensagem = `Seu código de convite é: ${data.token}`;

      return sendMessage(targetNumber, data.name || "", mensagem);
    },
  };
}

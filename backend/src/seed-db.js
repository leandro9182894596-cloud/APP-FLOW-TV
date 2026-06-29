
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Verifica se já existe configuração
  const existingConfig = await prisma.appConfig.findUnique({
    where: { id: 1 },
  });

  if (existingConfig) {
    console.log('✅ Configuração já existe! Nada a fazer.');
    return;
  }

  // Cria senha admin padrão (hash)
  const defaultAdminPassword = await bcrypt.hash('admin123', 10);

  // Cria configuração inicial
  await prisma.appConfig.create({
    data: {
      id: 1,
      logo: null,
      background: null,
      banner: null,
      bannerLink: null,
      banners: null,
      dnsList: [],
      paymentInfo: null,
      paymentStatus: null,
      adminPassword: defaultAdminPassword,
    },
  });

  console.log('✅ Configuração inicial criada com sucesso!');
  console.log('🔑 Senha admin padrão: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


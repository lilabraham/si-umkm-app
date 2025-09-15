// LOKASI FILE: src/pages/dashboard/chat.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import SellerLayout from '@/components/layout/SellerLayout';
import withAuth from '@/components/common/withAuth';
import ChatWindow from '@/components/chat/ChatWindow';
// ⛔️ HAPUS: import { useConversations } from '@/hooks/useConversations';

const SellerChatPage: NextPage = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <SellerLayout>
      <Head><title>Chat dengan Admin - SI-UMKM</title></Head>
      <div className="p-6 lg:p-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Bantuan & Chat</h1>
        <p className="text-slate-600 mb-6">
          Sampaikan pertanyaan atau keluhan Anda. Admin akan membalas di sini.
        </p>
        <ChatWindow
          conversationId={currentUser.uid}   // 1 seller = 1 conversation
          meUid={currentUser.uid}
          isAdmin={false}
          autoCreateIfMissing={true}
          headerTitle="Admin SI-UMKM"
        />
      </div>
    </SellerLayout>
  );
};

export default withAuth(SellerChatPage, ['penjual', 'admin']);

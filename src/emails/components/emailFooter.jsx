import { Hr, Section, Text, Link } from '@react-email/components';

export const EmailFooter = ({ unsubscribeUrl }) => (
    <Section style={{ padding: '24px 40px', backgroundColor: '#f8fafc' }}>
        <Hr style={{ borderColor: '#e2e8f0' }} />
        <Text style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
            You're receiving this because you opted in.{' '}
            <Link href={unsubscribeUrl} style={{ color: '#6366f1' }}>Unsubscribe</Link>
        </Text>
    </Section>
);
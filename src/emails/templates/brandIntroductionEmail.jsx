import {
    Html, Head, Body, Container, Section,
    Text, Button, Preview
} from '@react-email/components';
import { EmailHeader } from '../components/emailHeader';
import { EmailFooter } from '../components/emailFooter';

// ─── These props map directly to your Firebase project + lead data ───
export const BrandIntroductionEmail = ({
    // Lead data
    leadFirstName = 'there',
    // Project data
    projectName = 'Our Company',
    industry = 'your industry',
    mainBenefit = 'streamline your workflow',
    keyFeature1 = 'powerful automation',
    keyFeature2 = 'real-time analytics',
    website = 'https://yourwebsite.com',
    // System
    unsubscribeUrl = '#',
}) => (
    <Html lang="en">
        <Head />
        <Preview>We help {industry} companies {mainBenefit}</Preview>
        <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f1f5f9' }}>
            <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>

                <EmailHeader projectName={projectName} />

                <Section style={{ padding: '40px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
                        Hi {leadFirstName},
                    </Text>
                    <Text style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
                        We work with companies in <strong>{industry}</strong> to help them{' '}
                        <strong>{mainBenefit}</strong> — and I wanted to reach out personally.
                    </Text>
                    <Text style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
                        Here's what makes us different:
                    </Text>
                    <Text style={{ fontSize: '15px', color: '#475569' }}>✅ {keyFeature1}</Text>
                    <Text style={{ fontSize: '15px', color: '#475569' }}>✅ {keyFeature2}</Text>

                    <Button
                        href={website}
                        style={{
                            backgroundColor: '#4f46e5', color: '#fff',
                            padding: '14px 28px', borderRadius: '8px',
                            fontWeight: 'bold', marginTop: '24px', display: 'inline-block'
                        }}
                    >
                        Learn More →
                    </Button>
                </Section>

                <EmailFooter unsubscribeUrl={unsubscribeUrl} />
            </Container>
        </Body>
    </Html>
);

export default BrandIntroductionEmail;
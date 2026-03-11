import { Img, Section, Text } from '@react-email/components';

export const EmailHeader = ({ projectName }) => (
    <Section style={{ backgroundColor: '#4f46e5', padding: '24px 40px' }}>
        <Text style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            {projectName}
        </Text>
    </Section>
);
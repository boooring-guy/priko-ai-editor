import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OtpEmailProps {
  otp: string;
}

export const OtpEmail = ({ otp }: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your verification code for Priko</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your identity</Heading>
          <Text style={text}>
            We received a request to verify your email address. Your
            verification code is:
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={text}>
            If you didn't request this code, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} Priko. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OtpEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  maxWidth: "480px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "0 0 20px 0",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const codeContainer = {
  background: "#f4f4f5",
  borderRadius: "4px",
  margin: "16px 0",
  padding: "20px",
  textAlign: "center" as const,
};

const code = {
  color: "#000",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "8px",
  lineHeight: "32px",
  margin: "0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "48px",
};

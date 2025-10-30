import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

type StockAlertEmailProps = {
  userName: string;
  products: Array<{
    title: string;
    currentStock: number;
    threshold: number;
    mainImageUrl?: string | null;
  }>;
  shopUrl: string;
};

export default function StockAlertEmail({
  userName = 'there',
  products = [],
  shopUrl = 'https://etsy-organizer.vercel.app/products',
}: StockAlertEmailProps) {
  const outOfStock = products.filter((p) => p.currentStock === 0);
  const lowStock = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.threshold);

  return (
    <Html>
      <Head />
      <Preview>
        {outOfStock.length > 0
          ? `${outOfStock.length} products out of stock`
          : `${lowStock.length} products low on stock`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Low Stock Alert</Heading>

          <Text style={text}>
            Hi {userName},
          </Text>

          <Text style={text}>
            You have inventory that needs attention in your Etsy shop.
          </Text>

          {outOfStock.length > 0 && (
            <>
              <Heading as="h2" style={h2}>
                Out of Stock ({outOfStock.length})
              </Heading>
              {outOfStock.map((product, index) => (
                <Section key={index} style={productSection}>
                  <Text style={productTitle}>{product.title}</Text>
                  <Text style={stockText}>
                    <strong style={outOfStockBadge}>OUT OF STOCK</strong>
                  </Text>
                </Section>
              ))}
            </>
          )}

          {lowStock.length > 0 && (
            <>
              <Heading as="h2" style={h2}>
                Low Stock ({lowStock.length})
              </Heading>
              {lowStock.map((product, index) => (
                <Section key={index} style={productSection}>
                  <Text style={productTitle}>{product.title}</Text>
                  <Text style={stockText}>
                    Only <strong style={lowStockBadge}>{product.currentStock} left</strong> (threshold: {product.threshold})
                  </Text>
                </Section>
              ))}
            </>
          )}

          <Hr style={hr} />

          <Section style={buttonContainer}>
            <Button style={button} href={shopUrl}>
              View Products
            </Button>
          </Section>

          <Text style={footer}>
            This is an automated alert from Etsy Organiser.
            <br />
            <Link href={shopUrl + '/../settings'} style={link}>
              Manage your notification settings
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const h2 = {
  color: '#4a4a4a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 40px 16px',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 40px',
};

const productSection = {
  padding: '12px 40px',
  borderBottom: '1px solid #e6e6e6',
};

const productTitle = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  color: '#1a1a1a',
};

const stockText = {
  fontSize: '14px',
  margin: '0',
  color: '#666',
};

const outOfStockBadge = {
  color: '#dc2626',
  fontWeight: 'bold',
};

const lowStockBadge = {
  color: '#ca8a04',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 40px',
};

const buttonContainer = {
  padding: '0 40px',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
};

const link = {
  color: '#000000',
  textDecoration: 'underline',
};

import { Link } from 'expo-router';

import {
    Body,
    Container,
    Heading2,
    VStack
} from '@/components/design-system';
import { DesignTokens } from '@/constants/design-tokens';

export default function ModalScreen() {
  return (
    <Container 
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: DesignTokens.spacing.lg
      }}
    >
      <VStack gap="lg" align="center">
        <Heading2 color={DesignTokens.colors.neutral[900]} weight="bold">
          This is a modal
        </Heading2>
        
        <Link href="/" dismissTo style={{ marginTop: DesignTokens.spacing.md }}>
          <Body color={DesignTokens.colors.primary[600]}>
            Go to home screen
          </Body>
        </Link>
      </VStack>
    </Container>
  );
}

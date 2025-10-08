import { Button } from '@ui/button';
import { Input } from '@components/input';
import type { Theme } from '@theme/base';

// Test with various version formats
import { Card } from '@ui/card';
import { Modal } from '@components/modal';
import { Layout } from '@layout/main';

export const TestComponent = () => {
  return (
    <div>
      <Button>Click me</Button>
      <Input placeholder="Type here" />
    </div>
  );
};
# CortexReach - Quick Reference Guide

## 🎯 Common Tasks

### Adding a New Page

1. **Create the page component:**
```bash
# Create file: src/pages/MyNewPage.jsx
```

```jsx
import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const MyNewPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <TitleComponent type="h2" className="text-gray-800">
          My New Page
        </TitleComponent>
        <TitleComponent type="p" size="base" className="text-gray-600 mt-1">
          Page description goes here
        </TitleComponent>
      </div>

      <Card>
        {/* Your content */}
      </Card>
    </div>
  )
}

export default MyNewPage
```

2. **Add route in App.jsx:**
```jsx
import MyNewPage from './pages/MyNewPage'

// Inside Routes
<Route path="my-new-page" element={<MyNewPage />} />
```

3. **Add to sidebar navigation:**
In `src/components/layout/Sidebar.jsx`, add to `menuItems` array:
```jsx
{ path: '/my-new-page', icon: 'fa-star', label: 'My New Page' }
```

---

### Creating a New Reusable Component

```jsx
// src/components/ui/MyComponent.jsx
import PropTypes from 'prop-types'
import clsx from 'clsx'

const MyComponent = ({ className = '', children, ...props }) => {
  return (
    <div className={clsx('base-classes', className)} {...props}>
      {children}
    </div>
  )
}

MyComponent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

export default MyComponent
```

---

### Using Icons

Font Awesome is available throughout the app:

```jsx
// Solid icons
<i className="fas fa-user"></i>
<i className="fas fa-envelope"></i>
<i className="fas fa-chart-line"></i>

// With custom styling
<i className="fas fa-plus text-blue-600 text-xl"></i>

// In buttons
<Button variant="primary">
  <i className="fas fa-plus mr-2"></i>
  Create New
</Button>
```

**Find icons:** https://fontawesome.com/search?o=r&m=free

---

### Typography System

```jsx
// Headings
<TitleComponent type="h1" className="text-gray-900">
  Main Heading
</TitleComponent>

<TitleComponent type="h2" className="text-gray-800">
  Page Title
</TitleComponent>

<TitleComponent type="h3" className="text-gray-800">
  Section Title
</TitleComponent>

<TitleComponent type="h4" className="text-gray-900">
  Card Title
</TitleComponent>

// Paragraphs with sizes
<TitleComponent type="p" size="extra-large-bold" className="text-gray-900">
  Large bold text
</TitleComponent>

<TitleComponent type="p" size="base-medium" className="text-gray-700">
  Regular medium text
</TitleComponent>

<TitleComponent type="p" size="small" className="text-gray-600">
  Small text
</TitleComponent>

<TitleComponent type="p" size="extra-small" className="text-gray-500">
  Tiny text
</TitleComponent>
```

---

### Common Layouts

#### Two-Column Grid
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card>Column 1</Card>
  <Card>Column 2</Card>
</div>
```

#### Four-Column Stats
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>Stat 1</Card>
  <Card>Stat 2</Card>
  <Card>Stat 3</Card>
  <Card>Stat 4</Card>
</div>
```

#### Flex Row with Spacing
```jsx
<div className="flex items-center justify-between gap-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

#### Vertical Stack
```jsx
<div className="space-y-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

---

### Forms

#### Basic Form
```jsx
const [formData, setFormData] = useState({
  name: '',
  email: ''
})

const handleSubmit = (e) => {
  e.preventDefault()
  // TODO: Submit to API
  console.log(formData)
}

return (
  <form onSubmit={handleSubmit} className="space-y-4">
    <Input
      label="Name"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      required
    />
    
    <Input
      label="Email"
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      required
    />
    
    <Button type="submit" variant="primary">
      Submit
    </Button>
  </form>
)
```

#### Select Dropdown
```jsx
<select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
```

#### Checkbox
```jsx
<div className="flex items-center gap-2">
  <input 
    type="checkbox" 
    id="myCheckbox"
    checked={isChecked}
    onChange={(e) => setIsChecked(e.target.checked)}
    className="rounded"
  />
  <label htmlFor="myCheckbox" className="text-sm text-gray-700 cursor-pointer">
    Check me
  </label>
</div>
```

#### Textarea
```jsx
<textarea
  rows={4}
  placeholder="Enter text..."
  value={text}
  onChange={(e) => setText(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

---

### Tables

```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="text-left py-3 px-4">
          <TitleComponent type="p" size="small-semibold" className="text-gray-600">
            Column 1
          </TitleComponent>
        </th>
        <th className="text-left py-3 px-4">
          <TitleComponent type="p" size="small-semibold" className="text-gray-600">
            Column 2
          </TitleComponent>
        </th>
      </tr>
    </thead>
    <tbody>
      {data.map((item) => (
        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
          <td className="py-3 px-4">
            <TitleComponent type="p" size="base" className="text-gray-900">
              {item.name}
            </TitleComponent>
          </td>
          <td className="py-3 px-4">
            <Badge variant="success">{item.status}</Badge>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### Card Patterns

#### Stat Card
```jsx
<Card>
  <TitleComponent type="p" size="small" className="text-gray-600">
    Metric Name
  </TitleComponent>
  <TitleComponent type="h3" className="text-gray-900 mt-1">
    12,345
  </TitleComponent>
  <TitleComponent type="p" size="small" className="text-green-600 mt-1">
    +12.5%
  </TitleComponent>
</Card>
```

#### Action Card
```jsx
<Card className="cursor-pointer hover:shadow-md transition-shadow">
  <div className="flex items-center space-x-4">
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
      <i className="fas fa-plus text-blue-600 text-xl"></i>
    </div>
    <div>
      <TitleComponent type="h5" className="text-gray-900">
        Action Title
      </TitleComponent>
      <TitleComponent type="p" size="small" className="text-gray-600">
        Action description
      </TitleComponent>
    </div>
  </div>
</Card>
```

#### Info Card
```jsx
<Card className="bg-blue-50 border-blue-200">
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <i className="fas fa-info-circle text-blue-600 text-xl"></i>
      </div>
    </div>
    <div>
      <TitleComponent type="h5" className="text-blue-900 mb-1">
        Info Title
      </TitleComponent>
      <TitleComponent type="p" size="base" className="text-blue-800">
        Information message goes here
      </TitleComponent>
    </div>
  </div>
</Card>
```

---

### Badges for Status

```jsx
// Define status mapping
const getStatusBadge = (status) => {
  const variants = {
    'Active': 'success',
    'Paused': 'warning',
    'Draft': 'default',
    'Completed': 'info',
    'Error': 'danger'
  }
  return variants[status] || 'default'
}

// Use in component
<Badge variant={getStatusBadge(item.status)}>
  {item.status}
</Badge>
```

---

### Progress Bars

```jsx
// Simple progress bar
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-blue-600 h-2 rounded-full"
    style={{ width: `${percentage}%` }}
  ></div>
</div>

// With label
<div>
  <div className="flex justify-between text-xs text-gray-600 mb-1">
    <span>Progress</span>
    <span>{percentage}%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-green-600 h-2 rounded-full transition-all"
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
</div>
```

---

### Navigation Patterns

#### Link to Another Page
```jsx
import { Link } from 'react-router-dom'

<Link to="/campaigns/create">
  <Button variant="primary">Create Campaign</Button>
</Link>
```

#### Programmatic Navigation
```jsx
import { useNavigate } from 'react-router-dom'

const MyComponent = () => {
  const navigate = useNavigate()
  
  const handleClick = () => {
    // Do something
    navigate('/dashboard')
  }
  
  return <Button onClick={handleClick}>Go to Dashboard</Button>
}
```

---

### Loading States

```jsx
const [isLoading, setIsLoading] = useState(false)

if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
    </div>
  )
}
```

---

### Empty States

```jsx
{items.length === 0 && (
  <Card className="text-center py-12">
    <i className="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
    <TitleComponent type="h4" className="text-gray-900 mb-2">
      No items found
    </TitleComponent>
    <TitleComponent type="p" size="base" className="text-gray-600 mb-4">
      Get started by creating your first item
    </TitleComponent>
    <Button variant="primary">Create Item</Button>
  </Card>
)}
```

---

### Responsive Patterns

#### Show/Hide on Mobile
```jsx
{/* Hidden on mobile, visible on desktop */}
<div className="hidden md:block">Desktop only</div>

{/* Visible on mobile, hidden on desktop */}
<div className="block md:hidden">Mobile only</div>
```

#### Responsive Grid Columns
```jsx
{/* 1 col on mobile, 2 on tablet, 4 on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

#### Responsive Flex Direction
```jsx
{/* Stack on mobile, row on desktop */}
<div className="flex flex-col lg:flex-row gap-4">
```

---

### Color System

```jsx
// Primary blue
bg-blue-50    // Light background
bg-blue-100   // Icons background
bg-blue-600   // Primary actions
text-blue-600 // Primary text

// Success green
bg-green-100  text-green-600  // Light
bg-green-600  text-white      // Solid

// Warning yellow
bg-yellow-100 text-yellow-600 // Light
bg-yellow-600 text-white      // Solid

// Danger red
bg-red-100    text-red-600    // Light
bg-red-600    text-white      // Solid

// Neutral grays
text-gray-900 // Headings
text-gray-800 // Subheadings
text-gray-700 // Body text
text-gray-600 // Secondary text
text-gray-500 // Tertiary text
```

---

### Spacing Scale

```jsx
// Padding/Margin
p-2   // 0.5rem (8px)
p-4   // 1rem (16px)
p-6   // 1.5rem (24px)
p-8   // 2rem (32px)

// Gaps
gap-2  gap-4  gap-6

// Space between (applies margin to children)
space-y-4    // Vertical spacing
space-x-4    // Horizontal spacing
```

---

## 🎨 Tailwind Quick Reference

### Common Utilities

```jsx
// Flexbox
flex items-center justify-between
flex-col flex-row

// Grid
grid grid-cols-3 gap-4

// Text
text-sm text-base text-lg
font-medium font-semibold font-bold
text-center text-left

// Borders
border border-gray-200
rounded rounded-lg rounded-full

// Shadows
shadow-sm shadow-md shadow-lg

// Hover/Focus
hover:bg-gray-100
focus:ring-2 focus:ring-blue-500

// Transitions
transition-colors transition-shadow
duration-200
```

---

## ✅ Best Practices

1. **Always use TitleComponent** for text instead of raw HTML tags
2. **Prefer reusable components** (Card, Button, Badge) over custom markup
3. **Use placeholder comments** where backend integration is needed
4. **Keep components small** and focused on one responsibility
5. **Use PropTypes** for type checking
6. **Follow existing patterns** for consistency
7. **Use responsive classes** for mobile-first design
8. **Add hover states** for interactive elements

---

## 🐛 Debugging Tips

### Component Not Rendering
- Check import path
- Verify route is added in App.jsx
- Check for JSX syntax errors

### Styles Not Applied
- Ensure classes are in Tailwind format
- Check for typos in class names
- Verify Tailwind is processing the file

### State Not Updating
- Use functional setState for derived state
- Check if you're mutating state directly
- Add console.log to track updates

---

**Quick Start:** Copy any pattern above, modify as needed, and you're good to go! 🚀

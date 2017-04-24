
import * as Lint from "tslint";
import * as ts from "typescript";
import * as Case from 'case';

export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new ActionConstantWalker(sourceFile, this.getOptions()));
    }

}

// The walker takes care of all the work.
class ActionConstantWalker extends Lint.RuleWalker {

    ACTION_TYPE_SUFFIX = this.getOptions()[0] || 'ActionTypes';
    PROPERTY_VALUE_CASE = this.getOptions()[1] || 'title';
    ACTION_TYPE_IN_VALUE = this.getOptions()[2] === undefined ? true : this.getOptions()[2];
    ACTION_TYPE_VALUE_CASE = this.getOptions()[2] || 'capital'

    protected visitVariableDeclaration(node: ts.VariableDeclaration) {
        if (!this.isActionTypeDeclaration(node)) return;
        const objLiteral = node.initializer as ts.ObjectLiteralExpression;
        objLiteral.properties
            .filter(property => property.kind === ts.SyntaxKind.PropertyAssignment)
            .filter((property: ts.PropertyAssignment) => !!property.initializer)
            .map((property: ts.PropertyAssignment) => ({
                desiredValue: this.getDesiredName(node.name.getText(), property.name.getText()),
                valueNode: this.getClosestStringRepresentation(property.initializer)
            }))
            .filter(({ valueNode, desiredValue }) => valueNode.getText().indexOf(desiredValue) < 0)
            .forEach(values => this.createActionTypeFailure(values))
    }

    isActionTypeDeclaration(node: ts.VariableDeclaration) {
        return node.initializer
            && node.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression
            && node.name.getText().endsWith(this.ACTION_TYPE_SUFFIX)
    }

    createActionTypeFailure({ desiredValue, valueNode }: { desiredValue: string, valueNode: ts.Expression }) {
        const start = valueNode.getStart();
        const width = valueNode.getWidth();
        let fix: Lint.Fix;
        if (valueNode.kind === ts.SyntaxKind.StringLiteral) {
            fix = new Lint.Replacement(start + 1, width - 2, desiredValue);
        }
        this.addFailure(
            this.createFailure(start, width, this.getFailureString(desiredValue), fix)
        )
    }

    getDesiredName(prefixStr: string, valueStr: string) {
        return this.getDesiredPrefix(prefixStr) + this.toCase(this.PROPERTY_VALUE_CASE, valueStr);
    }

    getDesiredPrefix(prefix: string) {
        prefix = prefix.replace(this.ACTION_TYPE_SUFFIX, '');
        return this.ACTION_TYPE_IN_VALUE ? `[${this.toCase(this.ACTION_TYPE_VALUE_CASE, prefix)}] ` : '';
    }

    getClosestStringRepresentation(node: ts.Expression): ts.Expression {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const callExpression = node as ts.CallExpression;
            if (callExpression.arguments.length === 1 &&
                callExpression.arguments[0].kind === ts.SyntaxKind.StringLiteral) {
                return callExpression.arguments[0];
            }
        }
        return node;
    }


    getFailureString(str: string) {
        return `Action type property value must contain '${str}'`
    }

    toCase(desiredCase: string, str: string) {
        return ((Case as any)[desiredCase] || Case.title)(str);
    }

}
